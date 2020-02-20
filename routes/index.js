const express = require('express');
const router = express.Router();
const fs = require('fs');
require('dotenv').config();
const { exec } = require('child_process');
const envNames = process.env.ENV_FILE_NAMES && process.env.ENV_FILE_NAMES.split(',') || '';

/* GET home page. */

router.get('/', (req, res, next) => {
	const envType = req.query.env;
	const envPath = envType && process.env[`${envType.toUpperCase()}_APP_ENV_FILE_PATH`] || process.env['APP_ENV_FILE_PATH'];
	if(!envPath) {
	  console.log('APP_ENV_FILE_PATH: ', envPath);
	  res.send('[error] >>>>>>> APP_ENV_FILE_PATH does not exist or is invalid in config');
	  return;
    }
	fs.readFile(envPath, "utf8", (err, contents) => {
		let vars;
		if (!err) {
			vars = getParamsFromEnv(contents);
		}
		/*let textVars = '';
	    vars.forEach((l) => {
	    	textVars += l.key;
	    	textVars += '=';
	    	textVars += l.value;
	    	textVars += '\n';
		})*/

		res.render('index', { title: 'Femi Automated Deploy', vars, textVars: contents, envNames,  envType, error: err?'Error:' + err.message:null });
	});
});

/* POST home page. */
router.post('/', async (req, res, next) => {
	const envType = req.query.env;
	const envPath = envType && process.env[`${envType.toUpperCase()}_APP_ENV_FILE_PATH`] || process.env['APP_ENV_FILE_PATH'];
	const data = req.body;
	let error =  null;
	let message = null;

	if(data.env == '') {
		// res.send('Error >>>>> You must set both key and value');
		error = 'Parameters are empty';
	}
	if (!error) {
		await fs.writeFile(envPath, data.env, async (e) => {
			// console.log('eeee', e);
			if (e) {
				error = e.message;
			} else {
				message = 'Update successful!';
				const restartPath = envType && process.env[`${envType.toUpperCase()}_RESTART_FILE_PATH`] || process.env['RESTART_FILE_PATH'];
				if (restartPath) {
					await exec(restartPath, (err, stdout, stderr) => {
						if (err) {
							error = err.message;
							console.error(`exec error: ${err}`);
							console.error(`exec message >>>>>>>>>>>>>>>>>> : ${error}`);
						}
					});
				}
			}
			fs.readFile(envPath, "utf8", (err, contents) => {
				let vars;
				if (!err) {
					vars = getParamsFromEnv(contents);
				} else {
					error = err.message;
				}
				if (!error) {
					const found =  vars.filter(v => {
						return v.key == data.key || v.key === '#' + data.key;
					})
					if (found.length > 0) {

					}
				}

				/*let textVars = '';
				vars.forEach((l) => {
					textVars += l.key;
					textVars += '=';
					textVars += l.value;
					textVars += '\n';
				})*/
				res.render('index', { title: 'Femi Automated Deploy', textVars: contents , envNames, message, vars, error: error?'Error: ' + error:'' });
			});
		});
	}


});

function getParamsFromEnv(contents) {
	const lines = contents.split('\n').filter((l) => l.replace(' ', '') !='');
	return lines.map( (l) => {
		const pos = l.indexOf('=');
		const key = l.substring(0, pos);
		const val = l.substring(pos+1);
		return {
			key: key,
			value: val.replace(/\\(.)/mg, "$1")
		};
	});
}


module.exports = router;
