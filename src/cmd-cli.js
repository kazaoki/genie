
/**
 * cli: 起動中のコンテナ内でコマンドを実行する・コンテナのシェルに入る
 * -----------------------------------------------------------------------------
 * ex. g cli
 *     g cli ls -la
 *     g cli --host cont1 ls -la
 */

'use strict'

const lib = require('./libs.js')
const child = require('child_process')
const path = require('path')

module.exports = async option=>{

	// オプション設定
	let argv = option
		.usage('Usage: genie|g cli [Options] [Commands]')
		.options('host', {
			describe: '実行するホスト名を指定する'
		})
		.argv;
	;
	if(argv.help) {
		console.log()
		return lib.Message(option.help(), 'primary', 1)
	}

	// 設定
	let config = lib.loadConfig(argv);
	let host = argv.host ? argv.host : config.core.docker.name
	let cmds = process.argv.slice(process.argv.findIndex(elem=>elem===argv._[1])) // ちょっと強引だけど、デフォ引数を省いた位置から末尾までをコマンドラインとして取得する

	// dockerが起動しているか
	if(!lib.existContainers(config, '/'+host+'$')) lib.Error('dockerコンテナが起動していません: '+host)

	// 引数があれば実行して結果を返す
	if(argv._.length!==1) {
		let result = child.spawnSync('docker', ['exec', host, ...cmds]);
		if(result.status) {
			lib.Error(result.stderr.toString() || result.stdout.toString()) // dockerを通してるため stderr ではなく stdout 側にメッセージが流れてくる場合があるため
		} else {
			console.log(result.stdout.toString())
		}
	}

	// 引数が無ければコマンドラインに入る
	else {
		let login_path = '/';
		let current_dir = process.cwd();
		// ホスト側カレントディレクトリが .genie/～ 内ならゲスト内の同じ /genie/～ パスにログイン
		if(current_dir.indexOf(path.join(config.root, '.genie'))===0) {
			login_path = path.relative(path.join(config.root, '.genie'), current_dir)
			login_path = path.posix.join('/genie', login_path)
		}

		// ホスト側カレントディレクトリが Apacheの公開ディレクトリ内（例えばpublic_html/～） 内ならゲスト内の同じ /var/www/html/～ パスにログイン
		if(config.http.apache && config.http.apache.enabled
			&& current_dir.indexOf(path.join(config.root, config.http.apache.public_dir))===0
		) {
			login_path = path.relative(path.join(config.root, config.http.apache.public_dir), current_dir)
			login_path = path.posix.join('/var/www/html', login_path)
		}

		// いざログイン
		child.spawnSync('docker', ['exec', '-it', host, 'bash', '-c', `cd ${login_path} && bash`], {stdio: 'inherit'})
	}
};
