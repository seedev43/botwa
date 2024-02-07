const axios = require("axios") 
const fetch = require("node-fetch") 
const { emojis } = require("./emojis")
const fs = require("fs")
const API = "https://www.gstatic.com/android/keyboard/emojikitchen/"

function stripos (a, b, c) {
 const d = (a + '').toLowerCase()
 const e = (b + '').toLowerCase()
 let index = 0
 if ((index = d.indexOf(e, c)) !== -1) {
  return index
 }
 return false
}

function removePrefix(str, prefix) {
 if (0 === stripos(str, prefix)) {
  str = str.substr(prefix.length)
 } 
 return str
}

const codePointsToEmoji = (codepoints) =>
  codepoints.reduce((p, c) => p + String.fromCodePoint(c), "");

const getBuffer = async (url, options) => {
 try {
  options ? options : {}
  const res = await axios({
   method: "get",
   url,
   headers: {
    'DNT': 1,
    'Upgrade-Insecure-Request': 1
   },
   ...options,
   responseType: 'arraybuffer'
  })
  return res.data
 } catch (err) {
  return err
 }
}

const emojiMix = (e1, e2) => {
 
  let emoji1, emoji2 = []
  const codePoint = e1.codePointAt(0)
  for (const element of emojis) {
   const e = element[0]
   if (e.includes(codePoint)) {
    emoji1 = element
    break
   }
  } 
  if (e2 || (e1 && e1.length > 2)) {
   const codePoint = e2 ? e2.codePointAt(0) : e1.codePointAt(2)
   if(!e2) e2 = codePointsToEmoji([codePoint])
   for (const element of emojis) {
    const e = element[0]
    if (e.includes(codePoint)) {
     emoji2 = element
     break
    }
   }
  }
  let u1 = emoji1[0].map(c => "u" + c.toString(16)).join("-")
  let u2 = emoji2[0].map(c => "u" + c.toString(16)).join("-")
  return `${API}${emoji1[1]}/${u1}/${u1}_${u2}.png`
} 

async function fetchWeb(web, result = false) {
 let res = await fetch(web) 
 let gas = await res.text()
 if(!result) return res
 return gas
}

function randStr(length) {
 let result = ''
 let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
 let charactersLength = characters.length
 for ( let i = 0; i < length; i++ ) {
  result += characters.charAt(Math.floor(Math.random() * charactersLength))
 } 
 return result
}  

module.exports = { removePrefix, codePointsToEmoji, getBuffer, emojiMix, fetchWeb, randStr }
