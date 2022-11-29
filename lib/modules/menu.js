function secondtime(second) {
    var sec_num = parseInt(second, 10);
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    return hours+':'+minutes+':'+seconds;
}

exports.daftarTeks = {
    menuBot(name) {
        let teks = `Hai ${name}, Ada yang bisa Saya Bantu?
Premium: Yes
Prefik: ( . )
        
LIST MENU : 
        
Menu Sticker:                     
➸ .sticker
➸ .stoimg
➸ .sticker nobg
        
Menu Convert:
➸ .tomp3

Menu Grup:
➸ .hidetag
➸ .mute on
➸ .mute off
        
Menu Downloader
➸ .ytdl
➸ .play
➸ .tiktok
        
Random Teks:
➸ .quotes
➸ .randomfact

Random Image:
➸ .waifu
➸ .megumi
➸ .yorbriar
➸ .anya
➸ .loli
➸ .hololive
➸ .takagi
➸ .takagi
➸ .sagiri
➸ .elaina
➸ .lena
➸ .lily
➸ .fanart
➸ .uniform
➸ .chitanda
➸ .neko
➸ .emilia
➸ .honkai
➸ .genshin
➸ .azurlane
➸ .arknight
➸ .nsfw
        
Menu Game:
➸ .gi-build
➸ .gi-karakter
➸ .gi-material
➸ .ersignet

Weebs Menu:
➸ .whatanime

Other Menu:
➸ .math

Running Time: `+secondtime(process.uptime())  
        return teks
    },
  menuBotDemo(name) {
        let teks = `LIST MENU PREMIUM:
        
Menu Sticker:                     
➸ .sticker
➸ .stoimg
➸ .sticker nobg
        
Menu Convert:
➸ .tomp3

Menu Grup:
➸ .hidetag
➸ .mute on
➸ .mute off
        
Menu Downloader
➸ .ytdl
➸ .play
➸ .tiktok
        
Random Teks:
➸ .quotes
➸ .randomfact

Random Image:
➸ .waifu
➸ .megumi
➸ .yorbriar
➸ .anya
➸ .loli
➸ .hololive
➸ .takagi
➸ .maid
➸ .sagiri
➸ .elaina
➸ .lena
➸ .lily
➸ .fanart
➸ .uniform
➸ .chitanda
➸ .neko
➸ .emilia
➸ .honkai
➸ .genshin
➸ .azurlane
➸ .arknight
➸ .nsfw
        
Menu Game:
➸ .gi-build
➸ .gi-karakter
➸ .gi-material
➸ .ersignet

Weebs Menu:
➸ .whatanime

Other Menu:
➸ .math

Running Time: `+secondtime(process.uptime()) 
        return teks
    },
    menuBotFree(name) {
        let teks = `Hai ${name}, Ada yang bisa Saya Bantu?
Premium: No
Prefik: ( . )
        
LIST MENU : 
        
Menu Sticker:                     
➸ .sticker
➸ .stoimg
➸ ~.sticker nobg~
        
Menu Convert:
➸ ~.tomp3~

Menu Grup:
➸ .hidetag
➸ .mute on
➸ .mute off
        
Menu Downloader
➸ .ytdl
➸ .tiktok
➸ ~.play~
        
Random Teks:
➸ .quotes
➸ .randomfact

Random Image:
➸ .waifu
➸ .megumi
➸ .lena
➸ .lily
➸ .fanart
➸ .takagi
➸ .neko
➸ .honkai
➸ .genshin
➸ .arknight
➸ ~.yorbriar~
➸ ~.anya~
➸ ~.loli~
➸ ~.hololive~
➸ ~.sagiri~
➸ ~.elaina~
➸ ~.uniform~
➸ ~.chitanda~
➸ ~.emilia~
➸ ~.azurlane~
➸ ~.nsfw~
        
Menu Game:
➸ .gi-build
➸ .gi-karakter
➸ .gi-material
➸ .ersignet

Weebs Menu:
➸ ~.whatanime~

Other Menu:
➸ .math

Running Time: `+secondtime(process.uptime()) 
        return teks
    }

}