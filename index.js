import express from 'express';
import { Client, GatewayIntentBits } from 'discord.js';
import dotenv from 'dotenv';
dotenv.config();

// 🔵 Inicia servidor Express
const app = express();
const PORT = 3000;

app.get('/', (req, res) => {
  res.send('Bot de Discord activo 🟢');
});

app.listen(PORT, () => {
  console.log(`🌐 Servidor Express corriendo en http://localhost:${PORT}`);
});

// 🟢 Configura el bot de Discord
const GUILD_ID = process.env.GUILD_ID;
const ONLINE_CHANNEL_ID = process.env.ONLINE_CHANNEL_ID;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
  ],
});

client.once('ready', async () => {
  console.log(`✅ Bot conectado como ${client.user.tag}`);

  setInterval(async () => {
    try {
      const guild = await client.guilds.fetch(GUILD_ID);
      await guild.members.fetch({ withPresences: true });

      const onlineCount = guild.members.cache.filter(
        member => member.presence?.status === 'online'
      ).size;

      const channel = await guild.channels.fetch(ONLINE_CHANNEL_ID);

      if (channel && channel.manageable && typeof channel.setName === 'function') {
        await channel.setName(`🟢 Online: ${onlineCount}`);
        console.log(`🟢 Canal actualizado a ${onlineCount} usuarios online.`);
      } else {
        console.warn('⚠️ No se pudo modificar el canal. ¿Tiene permisos el bot?');
      }
    } catch (error) {
      console.error('❌ Error actualizando el canal:', error.message);
    }
  }, 5000); // Actualiza cada 5 segundos
});

// Manejo de eventos para reconexión y errores
client.on('error', error => {
  console.error('❌ Error del cliente Discord:', error);
});

client.on('warn', info => {
  console.warn('⚠️ Advertencia Discord:', info);
});

client.on('shardDisconnect', (event, shardId) => {
  console.warn(`⚠️ Shard ${shardId} desconectado. Intentando reconectar...`);
});

client.on('shardReconnecting', shardId => {
  console.log(`🔄 Shard ${shardId} intentando reconectar...`);
});

client.on('disconnect', event => {
  console.warn(`⚠️ Bot desconectado, código: ${event.code}. Reconectando...`);
  client.login(process.env.TOKEN).catch(console.error);
});

// Captura errores no manejados para evitar que el bot caiga
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Rechazo no manejado:', reason);
});

process.on('uncaughtException', error => {
  console.error('❌ Excepción no atrapada:', error);
});

// Login del bot
client.login(process.env.TOKEN);

