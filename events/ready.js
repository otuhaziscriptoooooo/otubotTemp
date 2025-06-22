const discord = require('discord.js');

module.exports = {
  name: discord.Events.ClientReady,
  async execute(client) {
    await client.user.setPresence({ activities: [{ name: `kondo`, type: discord.ActivityType.Custom }] });
    console.log("start")
    global.clientuser = client.user
}
};
