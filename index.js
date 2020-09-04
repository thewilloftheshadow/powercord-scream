const { Plugin } = require('powercord/entities');
const { getModule } = require("powercord/webpack");
const { inject, uninject } = require("powercord/injector");
const { messages } = require('powercord/webpack');
const { receiveMessage } = messages;
const dispatcher = getModule(["dirtyDispatch"], false);

module.exports = class Scream extends Plugin {
  async startPlugin () {
	  const { createBotMessage } = await getModule(['createBotMessage']);
	  
	  powercord.api.commands.registerCommand({
      command: 'scream',
      description: 'Scream your message',
      usage: '{c} <message>',
      executor: (args) => ({send: true, result: encode(args.join(" "))})
    });
	
	powercord.api.commands.registerCommand({
      command: 'descream',
      description: 'Decode a scream',
      usage: '{c} <message>',
      executor: (args) => ({send: false, result: decode(args.join(" "))})
    });
	  
	  powercord.api.commands.registerCommand({
      command: 'silentdescream',
      description: 'Silently decode a scream',
      usage: '{c} <message>',
      executor: (args) => ({send: false, result: decode(args.join(" "))})
    });
    
    let msgs = [];
	
	inject("scream-decode", dispatcher, "dispatch", (args) => {
		if(args[0].type === "MESSAGE_CREATE" && !args[0].optimistic){
			if(!msgs.includes(args[0].message.id)){
				msgs.push(args[0].message.id);
				setTimeout(() => {
					const index = msgs.indexOf(args[0].message.id);
					if (index > -1) {
						msgs.splice(index, 1);
					}
				}, 3000);
				let msg = args[0].message.content;
				if(msg.startsWith("hhAH")){
					msg = decode(msg);
					const receivedMessage = createBotMessage(args[0].message.channel_id, {});
					receivedMessage.content = msg;
					receiveMessage(receivedMessage.channel_id, receivedMessage);
				}
			}
		}
		return args;
	});
  }
		
	
	
  
  pluginWillUnload () {
    uninject("scream-decode");
  }
}

function encode1(input) {
	let out = "";
	
	[...input].forEach((item) => {
		out+=item.charCodeAt(0).toString(4).padStart(4, "0");
	});
	
	return out;
}

function decode1(input){
	let split = ((a,b)=>Array.from({length:Math.ceil(a.length/b)},(e,r)=>a.slice(r*b,r*b+b)))(input, 4);
	let out = "";
	
	split.forEach((item) => {
		out+=String.fromCharCode(parseInt(item, 4));
	});
	
	return out;
}

function encode(input){
	return encode1("§"+input).replace(/3/g, "H").replace(/2/g, "h").replace(/1/g, "A").replace(/0/g, "a");
}

function decode(input){
	
	return decode1(input.trim().replace(/[^aAhH]+/g).replace(/H/g, "3").replace(/h/g, "2").replace(/A/g, "1").replace(/a/g, "0")).substr(1);
}

