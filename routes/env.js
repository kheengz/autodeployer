const express = require('express');
const router = express.Router();
const fs = require('fs');
require('dotenv').config();
const { exec } = require('child_process');
const envPath = process.env.app_env_file_path;



/* GET home page. */

router.get('/', (req, res, next) => {
	if(!envPath) {
	  console.log('app_env_file_path: ', envPath);
	  res.send('[error] >>>>>>> app_env_file_path does not exist or is invalid in config');
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

		res.render('env', { title: 'Femi Automated Deploy', vars, textVars: contents, error: err?'Error:' + err.message:null });
	});
});

/* POST home page. */
router.post('/', (req, res, next) => {
    const data = req.body;
    let error =  null;
    let message = null;

	if(data.env == '') {
		// res.send('Error >>>>> You must set both key and value');
		error = 'Parameters are empty';
	}
	if (!error) {
		fs.writeFile(envPath, data.env, e => {
			console.log('eeee', e);
			if (e) {
				error = e.message;
			} else {
				message = 'Update successful!'
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
				res.render('env', { title: 'Femi Automated Deploy', textVars: contents , message, vars, error: error?'Error: ' + error:'' });
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
