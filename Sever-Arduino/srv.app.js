/**
 * srv.app.js – Handling HTTP:80 Requests
 * This file is part of noduino (c) 2012 Sebastian Müller <c@semu.mp>
 *
 * @package     noduino
 * @author      Sebastian Müller <c@semu.mp>
 * @license     MIT License – http://www.opensource.org/licenses/mit-license.php 
 * @url         https://github.com/semu/noduino
 */
 
define(['kickstart', 'module', 'path', 'fs'], function (kickstart, module, path, fs) {
  var args = process.argv.splice(2);

  var hostname = args[0] || 'localhost';
  var port = args[1] || 8080;
  var host = hostname + ':' + port;

  var kickstart = kickstart.withConfig({'name': hostname, 'port': port, 'path': './'});
  var srv = kickstart.srv();
  
  /**
   * Load file with example snippets
   */
  var fileContents = fs.readFileSync('./examples.snippet'),
    sections = (fileContents + '').split('###'),
    examples = {};
  for (var i = 0; i < sections.length; i++) {
    var tmp = sections[i].split("\n"),
      key = tmp.shift();
    tmp.pop();
    examples[key] = tmp.join("\n");
  }

  /** 
   * Catch request for serving home page
   */
  srv.all('/', function(req, res) {
    res.render('home', {hostname: hostname, jsApp: 'main', active: 'home', title: 'noduino', 'examples': examples});
  });

  /** 
   * Catch request for Getting Started page
   */
  srv.all('/getting-started.html', function(req, res) {
    res.render('getting-started', {hostname: hostname, jsApp: 'none', active: 'getting-started', title: 'noduino', 'examples': examples});
  });

  /** 
   * Catch request for serving walkLED example page
   */
  srv.all('/example-walkLED.html', function(req, res) {
    res.render('example-walkLED', {hostname: hostname, jsApp: 'walkLED', active: 'examples', title: 'noduino', 'examples': examples});
  });
  
  /**
   * Catch request for serving motor example
   */
  srv.all('/example-motor.html', function(req, res) {
    res.render('example-motor', {hostname: hostname, jsApp: 'motor', active: 'examples', title: 'noduino', 'examples': examples});
  });

  return {'kickstart': kickstart, 'srv': srv};
});
