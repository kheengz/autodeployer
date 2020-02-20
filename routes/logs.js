var express = require('express');
var router = express.Router();
require('dotenv').config();
const { exec } = require('child_process');
const fs = require('fs');
router.get('/', function(req, res, next) {
	const logType = req.query.log || 'output';
	let logFile = process.env[`${logType.toUpperCase()}_LOG_FILE`] || process.env['OUTPUT_LOG_FILE'];

	if (!logFile) {
		res.send('No ' + logFile + ' defined in configuration');
		return;
	}
	const n = req.query.lines || 200;
	fs.access(logFile, fs.F_OK, (err) => {
		if (err) {
			res.send(err);
			console.log(err);
			return
		}

		exec(`tail -n ${n} ${logFile}`, (err, stdout, stderr) => {
			if (err) {
				res.send(err);
				console.log(err);
				return;
			}
			res.render('logs', { title: 'Femi Automated Deploy - Logs', content: stdout , message: `${logType} Log: ${logFile}`, error: err?'Error: ' + err:'' });

		});

		return;
	})


});

module.exports = router;
