import { model, Schema } from 'mongoose';

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  webauthn: {
    challenge: String,
    resetChallengeExpiration: Date,
    credentialID: String,
    credentialPublicKey: String,
  },
});

// const p: string = path.join(process.cwd(), 'data', 'users.json');

// const getUsers = (cb: CallableFunction) => {
//   fs.readFile(p, (err: NodeJS.ErrnoException | null, fileContent: any) => {
//     if (err) cb([]);
//     else cb(JSON.parse(fileContent));
//   });
// };

// function save(this: User): User {
//   getUsers((users: User[]) => {
//     users = users.filter((user) => user.name != this.name);
//     users.push(this);

//     fs.writeFile(p, JSON.stringify(users), (err) => {
//       if (err) throw err;
//     });
//   });

//   return this;
// }

// export class User {
//   _id!: string;
//   name!: string;
//   webauthn!: Webauthn;

//   constructor(username: string, webauthn: Webauthn) {
//     this._id = randomUUID();
//     this.name = username.toLowerCase();
//     this.webauthn = webauthn;
//   }

//   save() {
//     getUsers((users: User[]) => {
//       users = users.filter((user) => user.name != this.name);
//       users.push(this);

//       fs.writeFile(p, JSON.stringify(users), (err) => {
//         if (err) throw err;
//       });
//     });

//     return this;
//   }

//   static findById(id: string) {}

//   static findOne(obj: any): Promise<User | undefined> {
//     let [key]: string[] = Object.keys(obj);

//     return new Promise((resolve, reject) =>
//       getUsers((users: User[]) => {
//         const user: User | undefined = users.find((user: any) => {
//           if (![key].includes('.') && user[key] == obj[key]) return user;

//           if (key.includes('.')) {
//             const ARRAY_OF_KEYS: string[] = key.split('.');

//             ARRAY_OF_KEYS.forEach((key: string) => {
//               if (typeof user == 'object' && !Array.isArray(user)) {
//                 user = user[key];
//               }
//             });

//             if (user == obj[key]) return user;
//           }
//         });

//         if (user) user.save = save;

//         resolve(user);
//       })
//     );
//   }
// }

export const User = model('User', userSchema);
