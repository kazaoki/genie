
/**
 * reject: 全てのdockerコンテナ・ボリュームを削除する
 * -----------------------------------------------------------------------------
 * ex. g reject
 *     g reject -f
 */

'use strict'

const lib = require('./libs.js')
const child = require('child_process')
const inquirer = require('inquirer')
const color = require('cli-color')

module.exports = async option=>{

	// オプション設定
	let argv = option
		.usage('Usage: genie|g reject [Options]')
		.options('force', {
			alias: 'f',
			describe: '選択肢を出さずにすぐに削除を開始する',
		})
		.options('locked', {
			alias: 'l',
			describe: '「locked_」から始まるボリューム・コンテナも対象にする',
		})
		.argv;
	;
	if(argv.help) {
		console.log()
		return lib.Message(option.help(), 'primary', 1)
	}

	// コンテナ一覧取得
	let list_containers = []
	let result = child.spawnSync('docker', ['ps', '-qa', '--format', '{{.Names}}\t{{.Status}}'])
	if(result.status) lib.Error(result.stderr.toString())
	for(let line of result.stdout.toString().trim().split(/\n/)) {
		if(!line) continue
		let column = line.split(/\t/)
		let name = column[0]
		let status = column[1]
		let is_locked = name.match(/^locked_/)
		let label = `[Container] ${name}`
		if(is_locked) label = color.blackBright(label)
		list_containers.push({
			name: label,
			checked: (is_locked&&(!argv.locked) ? false : true)
		})
	}

	// ボリューム一覧取得
	let list_volumes = []
	result = child.spawnSync('docker', ['volume', 'ls', '--format', '{{.Name}}\t{{.Driver}}'])
	if(result.status) lib.Error(result.stderr.toString())
	for(let line of result.stdout.toString().trim().split(/\n/)) {
		if(!line) continue
		let column = line.split(/\t/)
		let name = column[0]
		let driver = column[1]
		let is_locked = name.match(/^locked_/)
		let label = `[Volume] ${name}`
		if(is_locked) label = color.blackBright(label)
		list_volumes.push({
			name: label,
			checked: (is_locked&&(!argv.locked) ? false : true)
		})
	}

	// 対象数カウント
	let list_count = list_containers.length + list_volumes.length
	if(list_count===0) {
		return h('対象のオブジェクトはありませんでした。')
	}

	let answers

	if(argv.force) {
		// 強制リストアップ
		let list = [
			...list_containers,
			...list_volumes,
		]
		answers = {}
		answers.rejects= []
		for(let item of list) {
			item['checked'] && answers.rejects.push(item['name'])
		}
	} else {
		// リスト選択
		console.log()
		answers = await inquirer.prompt([
			{
				type: 'checkbox',
				message: '削除したいものにチェックを入れて Enter してください。',
				name: 'rejects',
				pageSize: 100,
				choices: [
					...list_containers,
					...list_volumes,
				],
			}
		])
		if(!answers.rejects.length) return;

		// 画面クリア
		process.stdout.write(color.move.up(list_count));
		for(let i=0; i<list_count; i++){
			process.stdout.write(color.erase.line);
			process.stdout.write(color.move.down(1));
		}
		process.stdout.write(color.move.up(list_count));

	}

	// 削除対象のコンテナ名・ボリューム名をセット
	let name_volumes = []
	let name_containters = []
	for(let label of answers.rejects) {
		label = color.strip(label);
		let matches = label.match(/^\[(Container|Volume)\] (.+)$/)
		if(matches[1]==='Container') name_containters.push(matches[2])
		else if(matches[1]==='Volume') name_volumes.push(matches[2])
	}

	console.log()

	// コンテナ削除実行
	let funcs = []
	for(let name of name_containters) {
		funcs.push(new Promise((resolve, reject)=>{
			child.spawn('docker', ['rm', '-fv', name])
				.stderr.on('data', data=>{
					console.log(`  [Container] ${name} - ${color.red('ng')}`)
					reject(data)
				})
				.on('close', code=>{
					console.log(`  [Container] ${name} - ${color.green('deleted')}`)
					resolve()
				})
		}))
	}
	await Promise.all(funcs).catch(err=>{lib.Error(err)})

	// コンテナ削除実行
	funcs = []
	for(let name of name_volumes) {
		funcs.push(new Promise((resolve, reject)=>{
			child.spawn('docker', ['volume', 'rm', '-f', name])
				.stderr.on('data', data=>{
					console.log(`  [Volume] ${name} - ${color.red('ng')}`)
					reject(data)
				})
				.on('close', code=>{
					console.log(`  [Volume] ${name} - ${color.green('deleted')}`)
					resolve()
				})
		}))
	}
	await Promise.all(funcs).catch(err=>{lib.Error(err)})

}
