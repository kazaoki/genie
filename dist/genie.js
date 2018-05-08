// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles

// eslint-disable-next-line no-global-assign
parcelRequire = (function (modules, cache, entry) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;

  for (var i = 0; i < entry.length; i++) {
    newRequire(entry[i]);
  }

  // Override the current require with this new one
  return newRequire;
})({2:[function(require,module,exports) {

'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const fs = require('fs');
const strwidth = require('string-width');
const color = require('cli-color');
const wrap = require('jp-wrap')(color.windowSize.width - 8);
const readline = require('readline').createInterface(process.stdin, process.stdout);
const child = require('child_process');
const path = require('path');
const util = require('util');

/**
 * d
 * -----------------------------------------------------------------------------
 * @param {object} ダンプ表示するデータオブジェクト
 */
const d = module.exports.d = data => console.log(util.inspect(data, { colors: true, compact: false, breakLength: 10, depth: 10 }));

/**
 * h
 * -----------------------------------------------------------------------------
 * @param {string} 見出し文字列
 * @param {function} cli-colorメソッド
 */
const h = module.exports.h = (title, clc = color.white) => console.log('\n  ' + clc(title));

/**
 * プロジェクトルートパスを返す（.genie/ がある直近の親ディレクトリを返す）
 * -----------------------------------------------------------------------------
 * @return {string} プロジェクトルートパス。失敗した場合はfalse
 */
const getProjectRootDir = module.exports.getProjectRootDir = () => {
	let root_dir = '';
	let check_dir = __dirname;
	let cont = true;
	do {
		try {
			fs.accessSync(check_dir + '/.genie');
			root_dir = check_dir;
		} catch (err) {
			let temp = check_dir;
			check_dir = path.dirname(check_dir);
			if (temp === check_dir) cont = false;
		}
	} while (root_dir === '' && cont);
	if (root_dir) {
		return root_dir;
	} else {
		Error('先祖ディレクトリに .genie/ が見つかりませんでした。\n`genie init` などして初期化してください。');
	}
};

/**
 * Repeat
 * -----------------------------------------------------------------------------
 * @param {string} string 繰り返したい文字
 * @param {number} times 繰り返したい回数
 * @return {string} 繰り返した文字列
 */
const Repeat = module.exports.Repeat = (string, times = 1) => {
	if (!times > 0) return '';
	let lump = '';
	for (let i = 0; i < times; i++) {
		lump += string;
	}
	return lump;
};

/**
 * Message
 * -----------------------------------------------------------------------------
 * @param {string} message 表示したいメッセージ。改行込み複数行対応。
 * @param {string} type タイプ。primary|success|danger|warning|info|default
 * @param {number} line タイトル線を引く位置。
 */
const Message = module.exports.Message = (message, type = 'default', line = 0) => {
	let indent = '  ';
	let line_color = color.white;
	let fg_color = color.white;
	if (type === 'primary') {
		line_color = color.xterm(26);
		fg_color = color.xterm(39);
	} else if (type === 'success') {
		line_color = color.green;
		fg_color = color.greenBright;
	} else if (type === 'danger') {
		line_color = color.red;
		fg_color = color.redBright;
	} else if (type === 'warning') {
		line_color = color.yellow;
		fg_color = color.yellowBright;
	} else if (type === 'info') {
		line_color = color.whiteBright;
		fg_color = color.whiteBright;
	} else if (type === 'whisper') {
		line_color = color.blackBright;
		fg_color = color.blackBright;
	}

	message = wrap(message.replace(/[\r\n]+$/, ''));
	let messages = message.split(/[\r\n]+/);
	let width = 0;
	for (let i in messages) {
		let len = strwidth(messages[i]);
		if (width < len) width = len;
	}
	width += 2;

	console.log(indent + line_color('┏') + line_color(Repeat('─', width)) + line_color('┓'));
	for (let i in messages) {
		if (line > 0 && line == i) {
			console.log(indent + line_color('┣') + line_color(Repeat('─', width)) + line_color('┫'));
		}
		console.log(indent + line_color('│') + fg_color(' ' + messages[i] + ' ') + Repeat(' ', width - 2 - strwidth(messages[i])) + line_color('│'));
	}
	console.log(indent + line_color('┗') + line_color(Repeat('─', width)) + line_color('┛'));
};

/**
 * Messages
 * -----------------------------------------------------------------------------
 * @param {objext} 複数メッセージを一挙に出力
 */
const Messages = module.exports.Messages = messages => {
	if (!Array.isArray(messages)) messages = [messages];
	for (let i in messages) {
		for (let key in messages[i]) {
			Message(messages[i][key], key);
		}
	}
};

/**
 * Input
 * -----------------------------------------------------------------------------
 * @param {string} message 入力を促す表示メッセージ
 * @param {number} tail_space 背景BOXの長さを追加する文字数
 * @return {string} 入力値
 */
const Input = module.exports.Input = (message, tail_space = 20) => {
	let indent = color.bgBlack('  ');
	message = '  ' + message + '  ';
	let len = strwidth(message) + tail_space;
	let fg = color.whiteBright.bgBlueBright;
	let bg = color.bgBlue;
	console.log('\n' + indent + fg(Repeat(' ', len)) + '\n' + indent + fg(message + Repeat(' ', tail_space)) + '\n' + indent + fg(Repeat(' ', len)) + '\n' + indent + bg(Repeat(' ', len)));
	process.stdout.write(color.move.up(3));
	process.stdout.write(color.move.right(len - tail_space));
	return new Promise(result => {
		readline.on('line', input => {
			process.stdout.write(color.move.down(3));
			result(input);
		});
	});
};

/**
 * Say
 * -----------------------------------------------------------------------------
 * @param {string} message スピーチする文字列
 */
const Say = module.exports.Say = message => {
	if (message.length === 0) return;
	// Macの場合はsayコマンド
	if (isMac()) {
		child.execSync(`say -r 300 "${message}"`);
	}
	// Windowsの場合はwscriptスクリプトをtempに用意してから実行（最後は削除する）
	else if (isWindows()) {
			let temp_dir = fs.mkdtempSync(process.env.TEMP + '/genie-say-');
			let temp_file = temp_dir + '/say.js';
			fs.writeFileSync(temp_file, `var args = [];for(var i = 0; i < WScript.Arguments.length; i++) args.push(WScript.Arguments.Item(i));WScript.CreateObject('SAPI.SpVoice').Speak('<volume level="100">'+'<rate speed="2">'+'<pitch middle="0">'+args.join(' ')+'</pitch>'+'</rate>'+'</volume>', 8);`);
			child.execSync(`start wscript ${temp_file} "${message}"`);
			fs.unlinkSync(temp_file);
			fs.rmdirSync(temp_dir);
		}
};

/**
 * loadConfig
 * -----------------------------------------------------------------------------
 * @param {object} argv コマンド引数
 */
const loadConfig = module.exports.loadConfig = argv => {

	// プロジェクトルートパス取得
	let root_dir = getProjectRootDir();
	let config_js = `${root_dir}/.genie/${argv.config}`;
	try {
		fs.accessSync(config_js);
	} catch (err) {
		Error(`設定ファイル（.genie/${argv.config}）が見つかりませんでした。`);
	}

	// ファイルロード
	let config = require(config_js).config;

	// 実行モードをセット
	config.runmode = argv.mode;

	// 実行時の定義をセット
	config.run = {};
	{
		// コンテナベース名セット
		config.run.base_name = argv.shadow ? config.core.docker.name + '-SHADOW' : config.core.docker.name;

		// プロジェクトルートセット
		config.run.project_dir = getProjectRootDir();

		// シャドウモードかセット
		if (argv.shadow) config.run.shadow = 1;
	}

	// config.jsでDockerMachine名が未指定でも環境変数に入っていればセット
	if (!config.core.docker.machine && process.env.DOCKER_MACHINE_NAME) {
		config.core.docker.machine = process.env.DOCKER_MACHINE_NAME;
	}

	// ブラウザから見る用のホストIPを取得しておく
	if (config.core.docker.ip_force) {
		config.run.host_ip = config.core.docker.ip_force;
	} else if (hasDockerMachineEnv() && config.core.docker.machine) {
		let result = child.spawnSync(`docker-machine ip ${config.core.docker.machine}`);
		if (result.status) Error(result.stderr.toString());
		config.run.host_ip = result.stdout.trim();
	} else {
		config.run.host_ip = 'localhost';
	}

	return config;
};

/**
 * isWindows
 * -----------------------------------------------------------------------------
 * @return {boolean} Windowsかどうか
 */
const isWindows = module.exports.isWindows = () => {
	return process.platform === 'win32';
};

/**
 * isMac
 * -----------------------------------------------------------------------------
 * @return {boolean} MacOSかどうか
 */
const isMac = module.exports.isMac = () => {
	return process.platform === 'darwin';
};

/**
 * hasDockerMachineEnv
 * -----------------------------------------------------------------------------
 * @return {boolean} DockerMachine環境があるかどうか
 */
const hasDockerMachineEnv = module.exports.hasDockerMachineEnv = () => {
	let result = child.spawnSync('docker-machine');
	return result.status === 0;
};

/**
 * Error
 * -----------------------------------------------------------------------------
 * @param {string} エラーメッセージ
 */
const Error = module.exports.Error = message => {
	console.log();
	Message(`エラーが発生しました。\n${message}`, 'danger', 1);
	Say('エラーが発生しました');
	process.exit();
};

/**
 * dockerDown
 * -----------------------------------------------------------------------------
 * @param {string} コンテナタイプ：genie|postgresql|mysql
 * @param {object} config
 */
const dockerDown = module.exports.dockerDown = (name_filter, config) => {
	return new Promise((resolve, reject) => {
		let containers = existContainers(config, name_filter);
		let delfuncs = [];
		for (let i = 0; i < containers.length; i++) {
			delfuncs.push(new Promise((ok, ng) => {
				process.stdout.write(color.blackBright(`  ${containers[i].name} (${containers[i].id}) ...`));
				let result = child.spawnSync('docker', ['rm', '-f', containers[i].id]);
				if (result.stderr.toString()) {
					process.stdout.write(color.red(' delete NG!\n'));
					ng(result.stderr.toString());
				} else {
					process.stdout.write(color.green(' deleted.\n'));
					ok();
				}
			}));
		}
		_asyncToGenerator(function* () {
			yield Promise.all(delfuncs).catch(function (err) {
				return err;
			});
		})();
		resolve();
	});
};

/**
 * dockerUp
 * -----------------------------------------------------------------------------
 * @param {string} type コンテナタイプ：genie|postgresql|mysql
 * @param {object} config 設定データ
 */
const dockerUp = module.exports.dockerUp = (type, config) => {

	// MySQLを起動
	if (type === 'mysql') {
		return new Promise((resolve, reject) => {
			try {
				let keys = Object.keys(config.db.mysql);
				for (let i = 0; i < keys.length; i++) {
					let mysql = config.db.mysql[keys[i]];

					// 引数用意
					let args = [];
					args.push('run', '-d', '-it');
					args.push('-e', 'TERM=xterm');
					args.push('--name', `${config.run.base_name}-mysql-${keys[i]}`);
					args.push('--label', `genie_project_dir="${config.run.project_dir}"`);
					if (config.run.shadow) args.push('--label', 'genie_shadow');
					args.push('-v', `${config.run.project_dir}/.genie/files/opt/mysql/:/opt/mysql/`);
					args.push('-v', `${mysql.volume_lock ? 'locked_' : ''}${config.run.base_name}-mysql-${keys[i]}:/var/lib/mysql`);
					args.push('-e', `MYSQL_LABEL=${keys[i]}`);
					args.push('-e', `MYSQL_ROOT_PASSWORD=${mysql.pass}`);
					args.push('-e', `MYSQL_DATABASE=${mysql.name}`);
					args.push('-e', `MYSQL_USER=${mysql.user}`);
					args.push('-e', `MYSQL_PASSWORD=${mysql.pass}`);
					args.push('-e', `MYSQL_CHARSET=${mysql.charset}`);
					if (config.core.docker.network) args.push(`--net=${config.core.docker.network}`);
					if (config.core.docker.options) args.push(`${config.core.docker.options}`);
					if (mysql.external_port) args.push('-p', `${mysql.external_port}:3306`);
					args.push('--entrypoint=/opt/mysql/before-entrypoint.sh');
					args.push('--restart=always');
					args.push(mysql.repository);
					args.push('mysqld');
					if (mysql.charset) args.push(`--character-set-server=${mysql.charset}`);
					if (mysql.collation) args.push(`--collation-server=${mysql.collation}`);

					// dockerコマンド実行
					let result = child.spawnSync('docker', args);
					if (result.stderr.toString()) {
						reject(result.stderr.toString());
					} else {
						resolve();
					}
				}
				resolve();
			} catch (err) {
				reject(err);
			}
		});
	}

	// PostgreSQLを起動
	else if (type === 'postgresql') {
			return new Promise((resolve, reject) => {
				try {
					let keys = Object.keys(config.db.postgresql);
					for (let i = 0; i < keys.length; i++) {
						let postgresql = config.db.postgresql[keys[i]];

						// 引数用意
						let args = [];
						args.push('run', '-d', '-it');
						args.push('-e', 'TERM=xterm');
						args.push('--name', `${config.run.base_name}-postgresql-${keys[i]}`);
						args.push('--label', `genie_project_dir="${config.run.project_dir}"`);
						if (config.run.shadow) args.push('--label', 'genie_shadow');
						args.push('-v', `${config.run.project_dir}/.genie/files/opt/postgresql/:/opt/postgresql/`);
						args.push('-v', `${postgresql.volume_lock ? 'locked_' : ''}${config.run.base_name}-postgresql-${keys[i]}:/var/lib/postgresql`);
						args.push('-e', `POSTGRES_LABEL=${keys[i]}`);
						args.push('-e', `POSTGRES_HOST=${postgresql.host}`);
						args.push('-e', `POSTGRES_DB=${postgresql.name}`);
						args.push('-e', `POSTGRES_USER=${postgresql.user}`);
						args.push('-e', `POSTGRES_PASSWORD=${postgresql.pass}`);
						args.push('-e', `POSTGERS_ENCODING=${postgresql.encoding}`);
						args.push('-e', `POSTGERS_LOCALE=${postgresql.locale}`);
						if (config.core.docker.network) args.push(`--net=${config.core.docker.network}`);
						if (config.core.docker.options) args.push(`${config.core.docker.options}`);
						if (postgresql.external_port) args.push('-p', `${postgresql.external_port}:5432`);
						args.push('--entrypoint=/opt/postgresql/before-entrypoint.sh');
						args.push('--restart=always');
						args.push(postgresql.repository);
						args.push('postgres');

						// dockerコマンド実行
						let result = child.spawnSync('docker', args);
						if (result.stderr.toString()) {
							reject(result.stderr.toString());
						} else {
							resolve();
						}
					}
					resolve();
				} catch (err) {
					reject(err);
				}
			});
		}

		// genie本体を起動
		else if (type === 'genie') {
				return new Promise((resolve, reject) => {
					// 基本引数
					let args = [];
					args.push('run', '-d', '-it');
					args.push('-e', 'TERM=xterm');
					args.push('-e', 'LANG=ja_JP.UTF-8');
					args.push('-e', 'LC_ALL=ja_JP.UTF-8');
					args.push('-v', config.run.project_dir + '/.genie/files/opt:/opt');
					args.push('--label', `genie_project_dir="${config.run.project_dir}"`);
					if (config.run.shadow) args.push('--label', 'genie_shadow');
					args.push(`--name=${config.run.base_name}`);
					if (config.core.docker.network) args.push(`--net=${config.core.docker.network}`);
					if (config.core.docker.options) args.push(`${config.core.docker.options}`);
					args.push('--restart=always');

					// Perl関係
					if (config.lang.perl.cpanfile_enabled) args.push('-e', 'PERL5LIB=/perl/cpanfile-modules/lib/perl5');

					// PostgreSQL関係
					if (config.db.postgresql) {
						let keys = Object.keys(config.db.postgresql);
						for (let i = 0; i < keys.length; i++) {
							let container_name = `${config.run.base_name}-postgresql-${keys[i]}`;
							args.push('--link', container_name);
							args.push('--add-host', config.db.postgresql[keys[i]].host + ':' + getContainerIp(container_name, config));
						}
					}

					// MySQL関係
					if (config.db.mysql) {
						let keys = Object.keys(config.db.mysql);
						for (let i = 0; i < keys.length; i++) {
							let container_name = `${config.run.base_name}-mysql-${keys[i]}`;
							args.push('--link', container_name);
							args.push('--add-host', config.db.mysql[keys[i]].host + ':' + getContainerIp(container_name, config));
						}
					}

					// SSHD関係
					if (config.trans.sshd) {
						args.push('-p', `${config.trans.sshd.external_port}:22`);
					}

					// Apache関係
					if (config.http.apache) {
						args.push('-v', `${config.run.project_dir}/${config.http.apache.public_dir}:/var/www/html`);
						if (config.http.apache.external_http_port) {
							args.push('-p', `${config.http.apache.external_http_port}:80`);
						}
						if (config.http.apache.external_https_port) {
							args.push('-p', `${config.http.apache.external_https_port}:443`);
						}
					}

					// Nginx関係
					if (config.http.nginx) {
						args.push('-v', `${config.run.project_dir}/${config.http.nginx.public_dir}:/usr/share/nginx/html`);
						if (config.http.nginx.external_http_port) {
							args.push('-p', `${config.http.nginx.external_http_port}:80`);
						}
						if (config.http.nginx.external_https_port) {
							args.push('-p', `${config.http.nginx.external_https_port}:443`);
						}
					}

					// Sendlog関係
					if (config.mail.sendlog.external_port) {
						args.push('-p', `${config.mail.sendlog.external_port}:9981`);
					}

					// Fluentd関係
					if (config.log.fluentd) {
						args.push('-v', `${config.run.project_dir}/.genie/files/opt/td-agent:/etc/td-agent`);
					}

					// 追加ホスト
					if (config.core.docker.hosts && Array.isArray(config.core.docker.hosts) && config.core.docker.hosts.length) {
						for (let i = 0; i < config.core.docker.hosts.length; i++) {
							args.push(`--add-host=${config.core.docker.hosts[i]}`);
						}
					}

					// 追加マウント
					args.push('-v', `${config.run.project_dir}/:/mnt/host/`);
					if (config.core.docker.volumes && Array.isArray(config.core.docker.volumes) && config.core.docker.volumes.length) {
						for (let i = 0; i < config.core.docker.volumes.length; i++) {
							if (config.core.docker.volumes[i].match(/^\//)) {
								args.push('-v', `${config.core.docker.volumes[i]}`);
							} else {
								args.push('-v', `${config.run.project_dir}/${config.core.docker.volumes[i]}`);
							}
						}
					}

					// 設定値を環境変数値に
					let envs = {};
					let conv = (data, parent_key) => {
						if (typeof data === 'object' && !Array.isArray(data)) {
							// 再帰
							let keys = Object.keys(data);
							for (let i = 0; i < keys.length; i++) {
								conv(data[keys[i]], `${parent_key}_${keys[i].toUpperCase()}`);
							}
						} else {
							// 変換してセット
							if (typeof data === 'object' && Array.isArray(data)) {
								envs[parent_key] = JSON.stringify(data);
							} else {
								envs[parent_key] = data;
							}
						}
					};
					conv(config, 'GENIE');
					envs.GENIE_RUNMODE = config.runmode;
					let keys = Object.keys(envs);
					for (let i = 0; i < keys.length; i++) {
						args.push('-e', `${keys[i]}=${envs[keys[i]]}`);
					}

					// イメージ指定
					args.push(config.core.docker.image);

					d(args.join(' '));

					// dockerコマンド実行
					let result = child.spawnSync('docker', args);
					if (result.stderr.toString()) {
						reject(result.stderr.toString());
					} else {
						resolve();
					}
				});
			}
};

/**
 * existContainers
 * -----------------------------------------------------------------------------
 * @param {object} config 設定データ
 * @param {string} name_filter dockerの--filter引数渡す`name=`以降の値。無ければ genie_project_dir と genie_shadow のラベルのみフィルター対象になる
 */
const existContainers = module.exports.existContainers = (config, name_filter) => {
	let filters = ['--filter', `label=genie_project_dir="${config.run.project_dir}"`];
	if (config.run.shadow) {
		filters.push('--filter', `label=genie_shadow`);
	}
	if (name_filter) filters.push('--filter', `name=${name_filter}`);
	let result = child.spawnSync('docker', ['ps', '-a', '--format', '{{.ID}}\t{{.Names}}', ...filters]);
	let conts = result.stdout.toString().split(/\n/);
	let cont_ids = [];
	for (let i = 0; i < conts.length; i++) {
		let colums = conts[i].split(/\s+/);
		if (colums[0]) {
			cont_ids.push({
				id: colums[0],
				name: colums[1]
			});
		}
	}
	return cont_ids.length ? cont_ids : false;
};

// /**
//  * exist_volumes
//  * -----------------------------------------------------------------------------
//  * @param {array} filters
//  */
// const exist_volumes = module.exports.exist_volumes = (type, config)=>{

// }

/**
 * getContainerIp
 * -----------------------------------------------------------------------------
 * @param {string} container_name コンテナ名
 */
const getContainerIp = module.exports.getContainerIp = (container_name, config) => {
	try {
		let result;
		if (config.core.docker.network) {
			result = child.spawnSync('docker', ['inspect', `--format={{.NetworkSettings.Networks.${config.core.docker.network}.IPAddress}}`, container_name]);
		} else {
			result = child.spawnSync('docker', ['inspect', `--format={{.NetworkSettings.IPAddress}}`, container_name]);
		}
		if (result.stderr.toString()) {
			Error(result.stderr.toString());
		} else {
			return result.stdout.toString().replace(/[\r\n]$/, '');
		}
	} catch (err) {
		Error(err);
	}
};
},{}],1:[function(require,module,exports) {
///usr/bin/env node

'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const inquirer = require('inquirer');
const opt = require('optimist');
const color = require('cli-color');
const child = require('child_process');
const cliui = require('cliui')({ width: color.windowSize.width - 4 });
const lib = require('./libs.js');
const d = lib.d;
const h = lib.h;

let argv = opt.usage('Usage: genie|g [Commands] [Options]').options('mode', {
	alias: 'm',
	default: 'develop',
	describe: '実行モードを指定可能'
}).options('config', {
	alias: 'c',
	default: 'config.js',
	describe: '設定ファイルを指定可能'
}).options('help', {
	alias: 'h',
	describe: '説明表示'
}).argv;

/**
 * demo
 * -----------------------------------------------------------------------------
 */
if (argv._[0] === 'demo') {
	_asyncToGenerator(function* () {

		// メッセージBOX
		console.log();
		lib.Message('サンプル：default', 'default');
		lib.Message('サンプル：primary', 'primary');
		lib.Message('サンプル：success', 'success');
		lib.Message('サンプル：danger', 'danger');
		lib.Message('サンプル：warning', 'warning');
		lib.Message('サンプル：info', 'info');
		lib.Message('改行込み、1ライン入れも可能。\ntest1\ntest2\ntest3', 'default', 1);

		// 入力BOX
		let input = yield lib.Input('入力BOX（入力文字を発音しますのでご注意）：', 20);
		lib.Message('入力された文字：' + input);

		// sayテスト
		lib.Say(input);

		// エラーテスト
		try {
			throw new Error('エラーテスト（終了コード255）');
		} catch (err) {
			console.log(err);
			process.exit(255);
		}

		process.exit();
	})();
}

/**
 * ls
 * -----------------------------------------------------------------------------
 */
else if (argv._[0] === 'ls') {

		// オプション設定
		let argv = opt.usage('Usage: genie|g ls [Options]').options('long', {
			alias: 'l',
			describe: 'コンテナ一覧がもうちょっとだけ詳細に出ます'
		}).argv;
		;
		if (argv.help) {
			opt.showHelp();
			process.exit();
		}

		// docker-machine が使える環境の場合はそれも一覧する
		if (lib.hasDockerMachineEnv()) {
			console.log('\n  DockeMachines');
			let result = child.spawnSync('docker-machine', ['ls']);
			if (result.status) lib.Error(result.stderr.toString());
			lib.Message(result.stdout.toString(), 'primary', 1);
		}

		// イメージ一覧
		{
			console.log('\n  Images');
			let result = child.spawnSync('docker', ['images']);
			if (result.status) lib.Error(result.stderr.toString());
			lib.Message(result.stdout.toString(), 'primary', 1);
		}

		// データボリューム一覧
		{
			console.log('\n  Volumes');
			let result = child.spawnSync('docker', ['volume', 'ls', '--format', 'table {{.Name}}\t{{.Driver}}\t{{.Scope}}\t{{.Mountpoint}}']);
			if (result.status) lib.Error(result.stderr.toString());
			lib.Message(result.stdout.toString(), 'primary', 1);
		}

		// コンテナ一覧
		{
			console.log('\n  Containers');
			let format = ['--format', '{{.Names}}\t{{.ID}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}'];
			let header = ['NAMES', 'ID', 'IMAGE', 'STATUS', 'PORTS'];
			if (argv.long) {
				format = ['--format', '{{.Names}}\t{{.ID}}\t{{.Image}}\t{{.Command}}\t{{.CreatedAt}}\t{{.Status}}\t{{.Ports}}\t{{.Labels}}'];
				header = ['NAMES', 'ID', 'IMAGE', 'COMMAND', 'CREATED AT', 'STATUS', 'PORTS', 'LABELS'];
			}
			let result = child.spawnSync('docker', ['ps', '-a', ...format]);
			if (result.status) lib.Error(result.stderr.toString());
			let lines = result.stdout.toString().trim().split('\n');
			lines.unshift(header.join('\t'));
			for (let i in lines) {
				let column = lines[i].split(/\t/);
				let set = [];
				for (let j in column) {
					let width;
					if (!argv.long) {
						// if(j==0) width = 40 // NAMES
						// if(j==1) width = 15 // ID
						// // if(j==2) width = 30 // IMAGE
						if (j == 4) width = 30; // PORTS
					} else {
						// if(j==0) width = 40 // NAMES
						// if(j==1) width = 15 // ID
						// // if(j==2) width = 30 // IMAGE
						if (j == 6) width = 30; // PORTS
						if (j == 7) width = 50; // LABELS
					}
					set.push({
						text: column[j].replace(/, ?/g, '\n'),
						width: width,
						padding: [0, 1, 0, 1]
					});
				}
				cliui.div(...set);
			}

			lib.Message(cliui.toString(), 'primary', 1);
		}

		process.exit();
	}

	/**
  * config
  * -----------------------------------------------------------------------------
  */
	else if (argv._[0] === 'config') {
			// オプション設定
			let argv = opt.usage('Usage: genie|g config [Options]').options('dump', {
				alias: 'd',
				describe: '設定値を確認します。'
			}).argv;
			;
			if (argv.help) opt.showHelp();else {

				// 設定ファイルロード
				let config = lib.loadConfig(argv);

				if (argv.dump) {
					// 設定値を表示する
					d(config);
				} else {
					// エディタで開く
					let config_js = `${lib.getProjectRootDir()}/.genie/${argv.config}`;
					if (lib.isWindows()) {
						child.execSync(`start ${config_js}`);
					} else if (lib.isMac()) {
						child.execSync(`open ${config_js}`);
					}
				}
			}

			process.exit();
		}

		/**
   * langver
   * -----------------------------------------------------------------------------
   */
		else if (argv._[0] === 'langver') {
				// オプション設定
				let argv = opt.usage('Usage: genie|g langver [Options]').options('php', { describe: 'PHPの利用可能なバージョン一覧を表示' }).options('perl', { describe: 'Perlの利用可能なバージョン一覧を表示' }).options('ruby', { describe: 'Rubyの利用可能なバージョン一覧を表示' }).options('node', { describe: 'Node.jsの利用可能なバージョン一覧を表示' }).argv;
				;
				if (argv.help) {
					opt.showHelp();
				} else if (argv.php) {
					let result = child.spawnSync('docker', ['run', '--rm', '--entrypoint=bash', 'kazaoki/genie', '-c', '/root/.anyenv/envs/phpenv/plugins/php-build/bin/php-build --definitions']);
					lib.Message(result.stdout.toString(), 'primary');
				} else if (argv.perl) {
					let result = child.spawnSync('docker', ['run', '--rm', '--entrypoint=bash', 'kazaoki/genie', '-c', '/root/.anyenv/envs/plenv/plugins/perl-build/perl-build  --definitions']);
					lib.Message(result.stdout.toString(), 'primary');
				} else if (argv.ruby) {
					let result = child.spawnSync('docker', ['run', '--rm', '--entrypoint=bash', 'kazaoki/genie', '-c', '/root/.anyenv/envs/rbenv/plugins/ruby-build/bin/ruby-build  --definitions']);
					lib.Message(result.stdout.toString(), 'primary');
				} else if (argv.node) {
					let result = child.spawnSync('docker', ['run', '--rm', '--entrypoint=bash', 'kazaoki/genie', '-c', '/root/.anyenv/envs/ndenv/plugins/node-build/bin/node-build  --definitions']);
					lib.Message(result.stdout.toString(), 'primary');
				} else {
					opt.showHelp();
				}

				process.exit();
			}

			/**
    * up
    * -----------------------------------------------------------------------------
    */
			else if (argv._[0] === 'up') {
					// オプション設定
					let argv = opt.usage('Usage: genie|g up [Options]').options('shadow', {
						alias: 's',
						describe: 'データをマウントではなくコンテナにコピーした別のコンテナを起動する'
					}).argv;
					;
					if (argv.help) opt.showHelp();

					// 設定ファイルロード
					let config = lib.loadConfig(argv);

					// 起動時メモの表示
					try {
						let memo = config.core.memo.up;
						if (memo) lib.Messages(memo);
					} catch (err) {
						Error('メモの設定が異常です。');
					}

					_asyncToGenerator(function* () {
						// 各コンテナ終了
						if (lib.existContainers(config)) {
							// h('対象の既存コンテナのみ削除します', color.blackBright);
							yield Promise.all([lib.dockerDown('/' + config.run.base_name + '-postgresql', config), // 前方一致のPostgreSQLコンテナ名
							lib.dockerDown('/' + config.run.base_name + '-mysql', config), // 前方一致のMySQLコンテナ名
							lib.dockerDown('/' + config.run.base_name + '$', config), // 完全一致のgenie本体コンテナ名
							lib.dockerDown(null, config)] // プロジェクトパスとshadowが一致するもの（＝ゴミコンテナ）削除
							).catch(function (err) {
								return err;
							});
						}

						let rundb_fucs = [];

						// PostgreSQL起動関数用意
						try {
							let keys = Object.keys(config.db.postgresql);
							if (keys.length) {
								// h('PostgreSQL起動開始')
								rundb_fucs.push(lib.dockerUp('postgresql', config));
							}
						} catch (err) {
							Error(err);
						}

						// MySQL起動関数用意
						try {
							let keys = Object.keys(config.db.mysql);
							if (keys.length) {
								// h('MySQL起動開始')
								rundb_fucs.push(lib.dockerUp('mysql', config));
							}
						} catch (err) {
							Error(err);
						}

						// 先にDBを起動開始
						yield Promise.all(rundb_fucs).catch(function (err) {
							lib.Error(err);
						});

						// genie本体起動関数用意
						// h('genie本体起動開始')
						yield lib.dockerUp('genie', config).catch(function (err) {
							return lib.Error(err);
						})

						// ブラウザ起動
						;

						h('起動完了!!');
						process.exit();
					})();
				}

				/**
     * down
     * -----------------------------------------------------------------------------
     */
				else if (argv._[0] === 'down') {
						// オプション設定
						let argv = opt.usage('Usage: genie|g down [Options]').options('shadow', {
							alias: 's',
							describe: 'データをマウントではなくコンテナにコピーした別のコンテナを終了する'
						}).argv;
						;
						if (argv.help) {
							opt.showHelp();
							process.exit();
						}

						// 設定ファイルロード
						let config = lib.loadConfig(argv);

						// 終了時メモの表示
						try {
							let memo = config.core.memo.down;
							if (memo) lib.Messages(memo);
						} catch (err) {
							Error('メモの設定が異常です。');
						}

						_asyncToGenerator(function* () {
							// 各コンテナ終了
							if (lib.existContainers(config)) {
								// h('対象の既存コンテナのみ削除します', color.blackBright);
								yield Promise.all([lib.dockerDown('/' + config.run.base_name + '-postgresql', config), // 前方一致のPostgreSQLコンテナ名
								lib.dockerDown('/' + config.run.base_name + '-mysql', config), // 前方一致のMySQLコンテナ名
								lib.dockerDown('/' + config.run.base_name + '$', config), // 完全一致のgenie本体コンテナ名
								lib.dockerDown(null, config)] // プロジェクトパスとshadowが一致するもの（＝ゴミコンテナ）削除
								).catch(function (err) {
									return err;
								});
							}

							h('DONE!');
							process.exit();
						})();
					}

					/**
      * build
      * -----------------------------------------------------------------------------
      */
					else if (argv._[0] === 'build') {
							// オプション設定
							let argv = opt.usage('Usage: genie|g build [Options]').options('no-cache', {
								alias: 'n',
								describe: 'キャッシュを使用せずにビルドする'
							}).argv;
							;
							if (argv.help) {
								console.log();
								lib.Message(opt.help(), 'success', 1);
								process.exit();
							}

							// 設定ファイルロード
							let config = lib.loadConfig(argv);

							_asyncToGenerator(function* () {
								// 確認
								let input = yield lib.Input(`${config.core.docker.image} イメージをビルドしてもよろしいでしょうか。[y/N]: `);

								// ビルド実行
								if (input.match(/^y$/i)) {
									let args = ['build', '-t', config.core.docker.image];
									if (argv['no-cache']) args.push('--no-cache');
									args.push(`${lib.getProjectRootDir()}/.genie/image/`);
									lib.Message(`ビルドを開始します。\ndocker ${args.join(' ')}`, 'info');
									console.log();
									let stream = child.spawn('docker', args);
									stream.stdout.on('data', function (data) {
										console.log(color.blackBright(data.toString().trim()));
									});
									stream.stderr.on('data', function (data) {
										lib.Error(data);
										process.exit();
									});
									stream.on('close', function (code) {
										let mes = 'ビルドが完了しました。';
										lib.Message(mes);
										lib.Say(mes);
										process.exit();
									});
								}
							})();
						}

						/**
       * cli
       * -----------------------------------------------------------------------------
       */
						else if (argv._[0] === 'cli') {
								// オプション設定
								let argv = opt.usage('Usage: genie|g cli [Options] [Commands]').options('host', {
									describe: '実行するホスト名を指定する'
								}).argv;
								;
								if (argv.help) {
									console.log();
									lib.Message(opt.help(), 'primary', 1);
									process.exit();
								}

								// 設定
								let config = lib.loadConfig(argv);
								let host = argv.host ? argv.host : config.core.docker.name;
								let cmds = process.argv.slice(process.argv.findIndex(elem => elem === argv._[1])); // ちょっと強引だけど、デフォ引数を省いた位置から末尾までをコマンドラインとして取得する

								// dockerが起動しているか
								if (!lib.existContainers(config, '/' + host + '$')) lib.Error('dockerコンテナが起動していません: ' + host);

								// 引数があれば実行して結果を返す
								if (argv._.length !== 1) {
									let result = child.spawnSync('docker', ['exec', host, ...cmds]);
									if (result.status) {
										lib.Error(result.stderr.toString() || result.stdout.toString()); // dockerを通してるため stderr ではなく stdout 側にメッセージが流れてくる場合があるため
										process.exit();
									}
									console.log(result.stdout.toString());
									process.exit();
								}

								// 引数が無ければコマンドラインに入る
								else {
										child.spawnSync('docker', ['exec', '-it', host, 'bash'], { stdio: 'inherit' });
										process.exit();
									}
							}

							/**
        * reject
        * -----------------------------------------------------------------------------
        */
							else if (argv._[0] === 'reject') {
									// オプション設定
									let argv = opt.usage('Usage: genie|g reject [Options]').options('force', {
										alias: 'f',
										describe: 'lockedから始まる名前も対象にする'
									}).argv;
									;
									if (argv.help) {
										console.log();
										lib.Message(opt.help(), 'primary', 1);
										process.exit();
									}

									// コンテナ一覧取得
									let list_containers = [];
									let result = child.spawnSync('docker', ['ps', '-qa', '--format', '{{.Names}}\t{{.Status}}']);
									if (result.status) lib.Error(result.stderr.toString());
									var _iteratorNormalCompletion = true;
									var _didIteratorError = false;
									var _iteratorError = undefined;

									try {
										for (var _iterator = result.stdout.toString().trim().split(/\n/)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
											let line = _step.value;

											if (!line) continue;
											let column = line.split(/\t/);
											let name = column[0];
											let status = column[1];
											let is_locked = name.match(/^locked_/);
											let label = `[Container] ${name}`;
											if (is_locked) label = color.blackBright(label);
											list_containers.push({
												name: label,
												checked: is_locked && !argv.f ? false : true
											});
										}

										// ボリューム一覧取得
									} catch (err) {
										_didIteratorError = true;
										_iteratorError = err;
									} finally {
										try {
											if (!_iteratorNormalCompletion && _iterator.return) {
												_iterator.return();
											}
										} finally {
											if (_didIteratorError) {
												throw _iteratorError;
											}
										}
									}

									let list_volumes = [];
									result = child.spawnSync('docker', ['volume', 'ls', '--format', '{{.Name}}\t{{.Driver}}']);
									if (result.status) lib.Error(result.stderr.toString());
									var _iteratorNormalCompletion2 = true;
									var _didIteratorError2 = false;
									var _iteratorError2 = undefined;

									try {
										for (var _iterator2 = result.stdout.toString().trim().split(/\n/)[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
											let line = _step2.value;

											if (!line) continue;
											let column = line.split(/\t/);
											let name = column[0];
											let driver = column[1];
											let is_locked = name.match(/^locked_/);
											let label = `[Volume] ${name}`;
											if (is_locked) label = color.blackBright(label);
											list_volumes.push({
												name: label,
												checked: is_locked && !argv.f ? false : true
											});
										}

										// 対象数カウント
									} catch (err) {
										_didIteratorError2 = true;
										_iteratorError2 = err;
									} finally {
										try {
											if (!_iteratorNormalCompletion2 && _iterator2.return) {
												_iterator2.return();
											}
										} finally {
											if (_didIteratorError2) {
												throw _iteratorError2;
											}
										}
									}

									let list_count = list_containers.length + list_volumes.length;
									if (list_count === 0) {
										h('対象のオブジェクトはありませんでした。');
										process.exit();
									}

									console.log();
									inquirer.prompt([{
										type: 'checkbox',
										message: '削除したいものにチェックを入れて Enter してください。',
										name: 'rejects',
										pageSize: 100,
										choices: [...list_containers, ...list_volumes]
									}]).then(answers => {

										// 画面クリア
										process.stdout.write(color.move.up(list_count));
										for (let i = 0; i < list_count; i++) {
											process.stdout.write(color.erase.line);
											process.stdout.write(color.move.down(1));
										}
										process.stdout.write(color.move.up(list_count - 1));

										// 削除処理開始
										var _iteratorNormalCompletion3 = true;
										var _didIteratorError3 = false;
										var _iteratorError3 = undefined;

										try {
											for (var _iterator3 = answers.rejects[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
												let label = _step3.value;

												label = color.strip(label);
												let matches = label.match(/^\[(Container|Volume)\] (.+)$/);
												// d(matches)

												// コンテナの削除
												if (matches[1] === 'Container') {
													let name = matches[2];
													process.stdout.write(`  [Container] ${name} - `);
													let run = child.spawnSync('docker', ['rm', '-f', name]);
													if (run.status) lib.Error(run.stderr.toString());
													process.stdout.write(color.green('deleted\n'));
												}
												// ボリュームの削除
												else if (matches[1] === 'Volume') {
														let name = matches[2];
														process.stdout.write(`  [Volume] ${name} - `);
														let run = child.spawnSync('docker', ['volume', 'rm', '-f', name]);
														if (run.status) lib.Error(run.stderr.toString());
														process.stdout.write(color.green('deleted\n'));
													}
											}
										} catch (err) {
											_didIteratorError3 = true;
											_iteratorError3 = err;
										} finally {
											try {
												if (!_iteratorNormalCompletion3 && _iterator3.return) {
													_iterator3.return();
												}
											} finally {
												if (_didIteratorError3) {
													throw _iteratorError3;
												}
											}
										}
									});
								}

								/**
         * clean
         * -----------------------------------------------------------------------------
         */
								else if (argv._[0] === 'clean') {
										// オプション設定
										let argv = opt.usage('Usage: genie|g clean [Options]').options('force', {
											alias: 'f',
											describe: 'lockedから始まる名前も対象にする'
										}).argv;
										;
										if (argv.help) {
											console.log();
											lib.Message(opt.help(), 'primary', 1);
											process.exit();
										}

										let cmd;
										let result;
										let count = 0;

										// コンテナ削除（exitedなやつ）
										cmd = ['ps', '-qa', '--filter', 'exited=0', '--format', '{{.Names}}'];
										result = child.spawnSync('docker', cmd);
										if (result.status) lib.Error(result.stderr.toString());
										var _iteratorNormalCompletion4 = true;
										var _didIteratorError4 = false;
										var _iteratorError4 = undefined;

										try {
											for (var _iterator4 = result.stdout.toString().trim().split(/\n/)[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
												let name = _step4.value;

												if (!name) continue;
												if (!argv.f) if (name.match(/^locked_/i)) continue;
												if (!count++) console.log();
												process.stdout.write(`  [Container] ${name} - `);
												let run = child.spawnSync('docker', ['rm', '-fv', name]);
												if (run.status) lib.Error(run.stderr.toString());
												process.stdout.write(color.green('deleted\n'));
											}

											// ボリューム削除（リンクされてないやつ）
										} catch (err) {
											_didIteratorError4 = true;
											_iteratorError4 = err;
										} finally {
											try {
												if (!_iteratorNormalCompletion4 && _iterator4.return) {
													_iterator4.return();
												}
											} finally {
												if (_didIteratorError4) {
													throw _iteratorError4;
												}
											}
										}

										cmd = ['volume', 'ls', '--filter', 'dangling=true', '--format', '{{.Name}}'];
										result = child.spawnSync('docker', cmd);
										if (result.status) lib.Error(result.stderr.toString());
										var _iteratorNormalCompletion5 = true;
										var _didIteratorError5 = false;
										var _iteratorError5 = undefined;

										try {
											for (var _iterator5 = result.stdout.toString().trim().split(/\n/)[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
												let name = _step5.value;

												if (!name) continue;
												if (!argv.f) if (name.match(/^locked_/i)) continue;
												if (!count++) console.log();
												process.stdout.write(`  [Volume] ${name} - `);
												let run = child.spawnSync('docker', ['volume', 'rm', '-f', name]);
												if (run.status) lib.Error(run.stderr.toString());
												process.stdout.write(color.green('deleted\n'));
											}

											// イメージ削除（<none>のやつ）
										} catch (err) {
											_didIteratorError5 = true;
											_iteratorError5 = err;
										} finally {
											try {
												if (!_iteratorNormalCompletion5 && _iterator5.return) {
													_iterator5.return();
												}
											} finally {
												if (_didIteratorError5) {
													throw _iteratorError5;
												}
											}
										}

										cmd = ['images', '-q', '--filter', 'dangling=true'];
										result = child.spawnSync('docker', cmd);
										if (result.status) lib.Error(result.stderr.toString());
										var _iteratorNormalCompletion6 = true;
										var _didIteratorError6 = false;
										var _iteratorError6 = undefined;

										try {
											for (var _iterator6 = result.stdout.toString().trim().split(/\n/)[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
												let id = _step6.value;

												if (!id) continue;
												if (!count++) console.log();
												process.stdout.write(`  [Image] ${id} - `);
												let run = child.spawnSync('docker', ['rmi', id]);
												if (run.status) lib.Error(run.stderr.toString());
												process.stdout.write(color.green('deleted\n'));
											}
										} catch (err) {
											_didIteratorError6 = true;
											_iteratorError6 = err;
										} finally {
											try {
												if (!_iteratorNormalCompletion6 && _iterator6.return) {
													_iterator6.return();
												}
											} finally {
												if (_didIteratorError6) {
													throw _iteratorError6;
												}
											}
										}

										if (!count) {
											h('対象のオブジェクトはありませんでした。');
										}

										process.exit();
									}

									/**
          * open
          * -----------------------------------------------------------------------------
          */
									else if (argv._[0] === 'open') {
											// オプション設定
											let argv = opt.usage('Usage: genie|g open [Options]').argv;
											;
											if (argv.help) {
												console.log();
												lib.Message(opt.help(), 'primary', 1);
												process.exit();
											}

											// 設定
											let config = lib.loadConfig(argv);

											// ブラウザで開く
											let cmd;
											if (lib.isWindows) {
												cmd = 'start';
											} else if (lib.isWindows) {
												cmd = 'open';
											} else {
												cmd = 'xdg-open';
											}
											let app = '';
											let internal_port = config.http.browser.schema === 'https' ? 443 : 80;
											let result = child.spawnSync('docker', ['port', config.run.base_name, internal_port]);
											if (result.status) Error(result.stderr.toString());
											let matches = result.stdout.toString().trim().match(/(\d+)$/);
											let port = matches[1];
											if (config.http.browser.schema === 'http' && port == 80 || config.http.browser.schema === 'https' && port == 443) {
												port = '';
											} else {
												port = `:${port}`;
											}
											let url = `${config.http.browser.schema}://${config.run.host_ip}${port}${config.http.browser.path}`;
											if (!(config.http.browser.apps && config.http.browser.apps.length)) config.http.browser.apps = [''];
											var _iteratorNormalCompletion7 = true;
											var _didIteratorError7 = false;
											var _iteratorError7 = undefined;

											try {
												for (var _iterator7 = config.http.browser.apps[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
													app = _step7.value;

													let arg = '';
													if (lib.isWindows()) {
														if (app === 'chrome') arg = ' chrome';else if (app === 'firefox') arg = ' firefox'; // できなかった
														else if (app === 'ie') arg = ' explorer';else if (app === 'opera') arg = ' opera'; // 未確認
															else if (app) {
																	arg = ` ${app}`;
																}
													} else {
														if (app === 'chrome') arg = ' -a chrome';else if (app === 'firefox') arg = ' -a firefox';else if (app === 'safari') arg = ' -a safari';else if (app === 'opera') arg = ' -a opera'; // 未確認
														else if (app) {
																arg = ` -a ${app}`;
															}
													}
													d(`${cmd}${arg} ${url}`);
													child.execSync(`${cmd}${arg} ${url}`);
												}
											} catch (err) {
												_didIteratorError7 = true;
												_iteratorError7 = err;
											} finally {
												try {
													if (!_iteratorNormalCompletion7 && _iterator7.return) {
														_iterator7.return();
													}
												} finally {
													if (_didIteratorError7) {
														throw _iteratorError7;
													}
												}
											}

											process.exit();
										}

										/**
           * help
           * -----------------------------------------------------------------------------
           */
										else {
												console.error(opt.help() + '\n' + 'Commands:\n' + '  init    \n' + '  config  設定を確認する\n' + '  ls      Dockerコンテナ状況を確認する\n' + '  up      設定に基づきDockerコンテナを起動する\n' + '  down    関連するコンテナのみ終了する\n' + '  update  \n' + '  cli     コンテナ内でコマンドを実行。またはコンテナに入る\n' + '  reject  genie対象外のコンテナまたはボリュームを一括削除する\n' + '  clean   不要なイメージ・終了済みコンテナ・リンクされてないボリュームを一括削除する\n' + '  build   基本のdockerイメージをビルドする\n' + '  langver 各種言語の利用可能なバージョンを確認する\n' + '  mysql   \n' + '  psql    \n' + '  open    ブラウザで開く\n' + '  ngrok   \n' + '  logs    \n' + '  dlsync  \n' + '  httpd   \n' + '  demo    デモ\n');

												process.exit();
											}
},{"./libs.js":2}]},{},[1])