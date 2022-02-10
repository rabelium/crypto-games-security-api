import { generateKeyPairSync } from 'crypto';
import { readFileSync, writeFileSync } from 'fs';
import { join as createPath } from 'path';

const keysPath = createPath(__dirname, '../../../keys');
let publicKey, privateKey;
try {
  console.log('keysPath', keysPath);

  publicKey = readFileSync(`${keysPath}/public.pub`);
  privateKey = readFileSync(`${keysPath}/private.pem`);
} catch (e) {
  const generated = generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  });

  publicKey = generated.publicKey;
  privateKey = generated.privateKey;

  writeFileSync(`${keysPath}/public.pub`, generated.publicKey);
  writeFileSync(`${keysPath}/private.pem`, generated.privateKey);
}

const jwtKeys = {
  secret: 'X2vFr7oxuxA3d0D0SS7pmcz2ytc05beb',
  ...{ publicKey, privateKey },
};

export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  jwt: {
    signOptions: {
      algorithm: 'HS512',
      expiresIn: '1d',
    },
    verifyOptions: {
      algorithms: ['HS512'],
      complete: true,
    },
    ...jwtKeys,
  },
  mongodb: {
    uri: 'mongodb://cryptousr:cryptopwd@mongodb:27017/cryptogames',
  },
  /*database: {
    autoLoadModels: true,
    synchronize: true,
    native: false,
    dialect: 'postgres',
    host: 'database',
    port: 5432,
    username: 'cryptousr',
    password: 'cryptopwd',
    database: 'cryptogames',
    models: entities,
    logging: false,
  },
  cassandra: {
    name: 'crypto-games',
    keepConnectionAlive: true,
    clientOptions: {
      contactPoints: ['database:9042'],
      keyspace: 'cryptogames',
      queryOptions: {
        autoPage: true,
      },
      authProvider: new auth.PlainTextAuthProvider('crypto', 'cryptoPwd'),
      elasticsearch: {
        host: 'database:9200',
        keepAlive: true,
        sniffOnStart: false,
      },
    },
    ormOptions: {
      defaultReplicationStrategy: {
        class: 'NetworkTopologyStrategy',
        crypto_dc: 1,
      },
      migration: 'drop',
      createKeyspace: true,
      manageESIndex: true,
    },
  },*/
});
