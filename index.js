// モジュール取得
const discord = require('discord.js'); // discord
const fs = require('fs'); // file system
const express = require('express');
const path = require('path'); // ファイルパスを操作するためのモジュールを追加
const app = express();

app.get('/', (req, res) => {
  res.send("hello");
});

app.listen(8080)

// クライアントを作成
global.client = new discord.Client({ intents: Object.values(discord.GatewayIntentBits)/* すべてのインテントを取得*/});


// イベントディレクトリを読み込む
const events = fs.readdirSync('./events/').filter(file => file.endsWith('.js'));

// イベントファイルをループ
for (const event of events) {
  // イベントを読み込む
  const data = require(`./events/${event}`);
  if (data.once) {
    // once: trueの場合client.onceで呼び出す
    global.client.once(data.name, (...args) => data.execute(...args));
  } else {
    // onceが偽の場合client.onで呼び出す
    global.client.on(data.name, (...args) => data.execute(...args));
  }
}

// コマンド用のオブジェクトを作成
const commands = {};

// コマンドフォルダをループする
['./commands/Admin', './commands/General', './commands/Other'].forEach(filePath => {
  // コマンドファイルをループする
  for (const file of fs.readdirSync(filePath).filter(file => file.endsWith('.js'))) {
    // Commandを読み込んでオブジェクトに保存
    const command = require(`./${filePath}/${file}`);
    commands[command.data.name] = command;
  }
});

// bot開始時にCommandを登録する
global.client.once(discord.Events.ClientReady, async () => {
  const data = []
  for (const commandName in commands) {
    data.push(commands[commandName].data)
  }
  await global.client.application.commands.set(data);
});

// コマンド実行を検知
global.client.on(discord.Events.InteractionCreate, async interaction => {
  if (!interaction.isCommand()) return;

  // 実行されたコマンドの内容を取得
  const command = commands[interaction.commandName];
  
  try {
    // Commandを実行
    await command.execute(interaction);
  } catch (error) {
    // エラーが出たときの処理
    await interaction.reply({
      content: `CommandExcusionError\`\`\`${error}\`\`\``,
      ephemeral: true,
    })
  }
});

function checktoken() {
  if (!process.env.BOT_TOKEN) {
    console.log("TOKENが設定されていません")
    return;
  }
  //login
  global.client.login(process.env.BOT_TOKEN);
}

checktoken();
