import { scrypt, randomBytes } from "crypto"
import { promisify } from "util"
// make the scryot function async compatible
const scryptAsync = promisify(scrypt)

export class Password {
  // change passord to hash
  static async toHash(password: string) {
    const salt = randomBytes(8).toString("hex")
    // add as Buffer for typescript to tell it what scryptAsync returned
    const buf = (await scryptAsync(password, salt, 64)) as Buffer
    // turn the buffer into a string and add salt onto the end
    return `${buf.toString("hex")}.${salt}`
  }
  // compare stored hash password to typed in password
  static async compare(storedPassword: string, suppliedPassword: string) {
    // split the hashed password and salt from stored password
    const [hashedPassword, salt] = storedPassword.split(".")
    // add as Buffer for typescript to tell it what scryptAsync returned
    const buf = (await scryptAsync(suppliedPassword, salt, 64)) as Buffer
    return buf.toString("hex") === hashedPassword
  }
}
