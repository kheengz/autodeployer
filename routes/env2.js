const express = require('express');
const router = express.Router();
const fs = require('fs');
require('dotenv').config();
const { exec } = require('child_process');
const envPath = process.env.APP_ENV_FILE_PATH;


/* GET home page. */

router.get('/', (req, res, next) => {
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
		res.render('env2', { title: 'Femi Automated Deploy', vars, error: err?'Error:' + err.message:null });
	});
});

/* POST home page. */
router.post('/', (req, res, next) => {
	const data = req.body;
	let error =  null;
	let message =  null;
	if ((!data.key || !data.value) && !data.delete) {
		// res.send('Error >>>>> You must set both key and value');
		error = 'You must set both key and value';
	}
	console.log('data: >>>>>>>>>>> ', data);
	if (!data.delete && data.key.indexOf(' ') > -1) {
		// res.send('Error >>>>> You must set both key and value');
		error = 'Key cannot have spaces';
	}

	fs.readFile(envPath, "utf8", (err, contents) => {
		let vars;
		if (!err) {
			vars = getParamsFromEnv(contents);
		} else {
		  error = err.message;
        }
		if (!error) {
      let lines = null;
      const found =  vars.filter(v => {
       return v.key == data.key || v.key === '#' + data.key;
      });
      if (data.delete) {
        lines = getEnvFromParams(vars, data.delete);
        vars = getParamsFromEnv(lines);
      } else if (found.length === 0) {
        vars.push({key: data.key, value: data.value});
        lines = getEnvFromParams(vars);
      } else {
        error = 'Key: ' + data.key + ' already exist';
      }

      if (lines) {
        fs.writeFile(envPath, lines, e => {
          if (e) {
            error = e.message;
          } else {
            message = 'Update successful!';
            if (process.env['RESTART_FILE_PATH']) {
              exec(process.env['RESTART_FILE_PATH'], (err, stdout, stderr) => {
                if (err) {
                  error = err.message;
                  console.error(`exec error: ${err}`);
                }
              });
            }
          }
        });
      }
    }
		res.render('env2', { title: 'Femi Automated Deploy', message, vars, error: error?'Error: ' + error:'' });
	});
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

function getEnvFromParams(vars, deleteKey = null) {
	let lines = '';
	for (let i = 0; i < vars.length; i++) {
	  if (i % 5 === 0) {
      lines += '\n';
    }
		if  (vars[i].key) {
			lines += deleteKey && vars[i].key.trim().toLowerCase() === deleteKey.trim().toLowerCase()
        ? '\n'
        : vars[i].key + '=' + vars[i].value + '\n';
		} else {
			lines += '\n';
		}
	}
	return lines;
}


module.exports = router;
