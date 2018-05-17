import bluebird from 'bluebird';
import redis from 'redis';

import config from './config';

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

const client = redis.createClient(config.redis);
const subscriber = redis.createClient(config.redis);

client.on('error', err => console.log(err)); // eslint-disable-line no-console
subscriber.on('error', err => console.log(err)); // eslint-disable-line no-console

export { client as redis, subscriber };
