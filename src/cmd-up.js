
/**
 * up: 設定に基づいてdockerを起動する
 * -----------------------------------------------------------------------------
 * ex. g up
 */

'use strict'

const lib = require('./libs.js')
const child = require('child_process')
const color = require('cli-color')
const fs = require('fs')

module.exports = async option=>{

	// オプション設定
	let argv = option
		.usage('Usage: genie|g up [Options]')
		.argv;
	;
	if(argv.help) {
		console.log()
		return lib.Message(option.help(), 'primary', 1)
	}

	// 設定ファイルロード
	let config = lib.loadConfig(argv);

	// ランモード表示
	lib.showRunmode()

	// 起動時メモの表示
	if(config.core.memo) {
		try {
			let memo = config.core.memo.up
			if(memo) lib.Messages(memo);
		} catch(err) {
			Error('メモの設定が異常です。')
		}
	}

	return new Promise(async (resolve, reject)=>
	{
		let rundb_funcs = []

		// 既存のコンテンツを先に終了させる（同モード＆同パス起動のコンテナ）
		await lib.dockerDown(config)

		// PostgreSQL起動関数用意
		if(config.db.postgresql) {
			fs.chmodSync(`${config.root}/.genie/files/opt/postgresql/before-entrypoint.sh`, 0o755)
			for(let key of Object.keys(config.db.postgresql)) {
				rundb_funcs.push(lib.dockerUpPostgreSQL(key, config))
			}
		}

		// MySQL起動関数用意
		if(config.db.mysql) {
			fs.chmodSync(`${config.root}/.genie/files/opt/mysql/before-entrypoint.sh`, 0o755)
			for(let key of Object.keys(config.db.mysql)) {
				rundb_funcs.push(lib.dockerUpMySQL(key, config))
			}
		}

		// 先にDBを並列起動開始
		Promise.all(rundb_funcs)
			.catch(err=>{lib.Error(err)})
			.then(
				// DB全てdocker起動完了したらgenie本体を起動開始
				()=>lib.dockerUp(config).catch(err=>lib.Error(err))
			)

		// 全コンテナで準備完了するまで、ステータスファイルを監視
		console.log()
		let count = 0;
		let done = [];
		let line;
		do {
			line = [];

			// PostgreSQL
			if(config.db.postgresql && Object.keys(config.db.postgresql).length) {
				for(let key of Object.keys(config.db.postgresql)) {
					let container_name = `${config.base_name}-postgresql-${key}`
					let result = child.spawnSync('docker', [
						'exec',
						container_name,
						'sh',
						'-c',
						'ps aux|grep entrypoint.sh|grep -v grep|wc -l',
					])
					if(done.indexOf(container_name)!==-1 || result.stdout.toString().trim()==='0') {
						line.push(`  ${container_name} ... ${color.green('ready!')}`)
						if(done.indexOf(container_name)===-1) done.push(container_name);
					} else {
						line.push(`  ${container_name} ... ${color.yellow('loading')}`)
					}
				}
			}

			// MySQL
			if(config.db.mysql && Object.keys(config.db.mysql).length) {
				for(let key of Object.keys(config.db.mysql)) {
					let container_name = `${config.base_name}-mysql-${key}`
					let result = child.spawnSync('docker', ['logs', container_name])
					let log = result.stdout.toString()
					if(done.indexOf(container_name)!==-1
						|| (log.match(/Initializing database/) && log.match(/MySQL init process done\. Ready for start up\./)) // ボリューム作成時
						|| (!log.match(/Initializing database/) && log.match(/mysqld\: ready for connections\./)) // ボリューム既存時
					) {
						line.push(`  ${container_name} ... ${color.green('ready!')}`)
						if(done.indexOf(container_name)===-1) done.push(container_name);
					} else if(process.env[`DOCKER_IMAGE_DOWN_LOADING_${container_name.toUpperCase()}`]) {
						line.push(`  ${container_name} ... ${color.yellow('image downloading')}`)
					} else {
						line.push(`  ${container_name} ... ${color.yellow('loading')}`)
					}
				}
			}

			// genie本体
			let result = child.spawnSync('docker', ['exec', config.base_name, 'cat', '/var/log/entrypoint.log'])
			let output = result.stdout.toString()
			if(done.indexOf(config.base_name)!==-1 || output.match(/entrypoint\.sh setup done\./)) {
				if(done.indexOf(config.base_name)===-1) done.push(config.base_name);
				line.push(`  ${config.base_name} ... ${color.green('ready!')}`)
			} else if(output.match(/init\.sh setup done\./)){
				line.push(`  ${config.base_name} ... ${color.yellow('init.sh setup')}`)
			} else if(output.match(/Postfix setup done\./)){
				line.push(`  ${config.base_name} ... ${color.yellow('Postfix setup')}`)
			} else if(output.match(/Nginx setup done\./)){
				line.push(`  ${config.base_name} ... ${color.yellow('Nginx setup')}`)
			} else if(output.match(/Apache setup done\./)){
				line.push(`  ${config.base_name} ... ${color.yellow('Apache setup')}`)
			} else if(output.match(/Node.js setup done\./)){
				line.push(`  ${config.base_name} ... ${color.yellow('Node.js setup')}`)
			} else if(output.match(/Ruby setup done\./)){
				line.push(`  ${config.base_name} ... ${color.yellow('Ruby setup')}`)
			} else if(output.match(/PHP setup done\./)){
				line.push(`  ${config.base_name} ... ${color.yellow('PHP setup')}`)
			} else if(output.match(/Perl setup done\./)){
				line.push(`  ${config.base_name} ... ${color.yellow('Perl setup')}`)
			} else if(output.match(/entrypoint\.sh setup start\./)){
				line.push(`  ${config.base_name} ... ${color.yellow('loading')}`)
			} else {
				line.push(`  ${config.base_name} ... ${color.yellow('waiting')}`)
			}

			// 状況出力
			if(count++) process.stdout.write(color.move.up(line.length));
			for(let string of line) {
				process.stdout.write(color.erase.line);
				console.log(string)
			}

			// 待ち
			if(done.length!==line.length) {
				await lib.sleep(100)
			}

		} while(done.length!==line.length)

		// TODO: ブラウザ起動
		if(config.http.browser.at_upped) await CMDS.open(option)

		// h('起動完了!!')
		resolve()
	})
};
