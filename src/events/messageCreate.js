const { Events, Message } = require("discord.js");
const uploadDomain = "cdn.jaylen.nyc" // Change this to the domain you want to upload this with

module.exports = {
  name: Events.MessageCreate,
  /**
   * 
   * @param {Message} message - The message instance
   */
  async execute(message, client) {
    const fetch = (await import('node-fetch')).default;

    // Check if the message has attachments or is a specific command
    if (message.attachments.size === 0) return;
    if (!message.mentions.has(client.user) && message.content !== "<@1262217161317814394>") return;

    const attachment = message.attachments.first();
    if (!attachment || !attachment.name.match(/\.(jpg|jpeg|png|gif|mp4)$/i)) return;

    // Extract the second word from the message content and will set it as a title IF there is one.
    const words = message.content.split(/\s+/);
    const newFilename = words.length >= 2 ? words[1] + attachment.name.slice(attachment.name.lastIndexOf('.')) : attachment.name;

    const form = new FormData();
    const payloadJson = JSON.stringify({
      domain: uploadDomain,
      name: newFilename
    });

    try {
      const res = await fetch(attachment.url);
      if (!res.ok) throw new Error(`Failed to fetch ${newFilename}: ${res.status} - ${res.statusText}`);

      const buffer = await res.arrayBuffer();
      const blob = new Blob([buffer], { type: attachment.contentType });

      form.append("payload_json", payloadJson);
      form.append("file", blob, newFilename);

      // Send POST request to Tixte API
      const apiUrl = "https://api.tixte.com/v1/upload";

      const uploadRes = await fetch(apiUrl, {
        method: "POST",
        headers: { Authorization: `${process.env.TIXTE_UPLOAD_KEY}` },
        body: form
      });

      if (!uploadRes.ok) {
        console.error(`Failed to upload ${newFilename}: ${uploadRes.status} - ${uploadRes.statusText}`);
        await message.react('❌');
        await message.reply(`Error uploading \`${newFilename}\`: \`${uploadRes.status}\` - ${uploadRes.statusText}`);
        return;
      }

      const jsonResponse = await uploadRes.json();
      
      // React with checkmark and reply with success message
      await message.react('✅');
      await message.reply(`[${newFilename}](${jsonResponse.data.url}) uploaded successfully.`);
    } catch (error) {
      console.error(`Error uploading ${newFilename}:`, error);
      await message.react('❌');
    }
  },
};
