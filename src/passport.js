/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

/**
 * Passport.js reference implementation.
 * The database schema used in this sample is available at
 * https://github.com/membership/membership.db/tree/master/postgres
 */

import passport from 'passport';
import { Strategy as WechatStrategy } from 'passport-wechat';
import config from './config';
import { User, UserClaim, UserLogin, UserProfile } from './data/models';

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

passport.use(
  new WechatStrategy(
    {
      appID: config.auth.wechat.appId,
      appSecret: config.auth.wechat.appSecret,
      callbackURL: 'http://shoutanwq.com/login/wechat/return',
      client: 'wechat',
      scope: 'snsapi_userinfo',
      passReqToCallback: true,
    },
    (req, accessToken, refreshToken, profile, expiredIn, done) => {
      /* eslint-disable no-underscore-dangle */
      const loginName = 'wechat';
      const claimType = 'urn:wechat:access_token';
      const id = profile.unionid || profile.openid;
      const fooBar = async () => {
        if (req.user) {
          const userLogin = await UserLogin.findOne({
            attributes: ['name', 'key'],
            where: { name: loginName, key: profile.openid },
          });
          if (userLogin) {
            // There is already a Facebook account that belongs to you.
            // Sign in with that account or delete it, then link it with your current account.
            await UserClaim.update({
              value: accessToken,
            }, {
              where: {
                userId: req.user.id,
              }
            })
            await UserProfile.update({
              displayName: profile.nickname,
              picture: profile.headimgurl,
            }, {
              where: {
                userId: req.user.id,
              }
            })
            done();
          } else {
            const user = await User.create(
              {
                id: req.user.id,
                email: `${id}@wechat.account.shoutanwq.com.`,
                logins: [{ name: loginName, key: profile.openid }],
                claims: [{ type: claimType, value: accessToken }],
                profile: {
                  displayName: profile.nickname,
                  gender: profile.sex,
                  picture: profile.headimgurl,
                },
              },
              {
                include: [
                  { model: UserLogin, as: 'logins' },
                  { model: UserClaim, as: 'claims' },
                  { model: UserProfile, as: 'profile' },
                ],
              },
            );
            done(null, {
              id: user.id,
              email: user.email,
            });
          }
        } else {
          const users = await User.findAll({
            attributes: ['id', 'email'],
            where: {
              '$logins.name$': loginName,
              '$logins.key$': profile.openid,
            },
            include: [
              {
                attributes: ['name', 'key'],
                model: UserLogin,
                as: 'logins',
                required: true,
              },
            ],
          });
          if (users.length) {
            const user = users[0].get({ plain: true });
            console.info('passport user:', user);
            done(null, user);
          } else {
            let user = await User.findOne({
              where: { email: `${id}@wechat.account.shoutanwq.com` },
            });
            if (user) {
              // There is already an account using this email address. Sign in to
              // that account and link it with Facebook manually from Account Settings.
              await UserClaim.update({
                value: accessToken,
              }, {
                where: {
                  userId: user.id,
                }
              })
              await UserProfile.update({
                displayName: profile.nickname,
                picture: profile.headimgurl,
              }, {
                where: {
                  userId: req.user.id,
                }
              })
              done(null);
            } else {
              user = await User.create(
                {
                  email: `${id}@wechat.account.shoutanwq.com`,
                  emailConfirmed: true,
                  logins: [{ name: loginName, key: profile.openid }],
                  claims: [{ type: claimType, value: accessToken }],
                  profile: {
                    displayName: profile.nickname,
                    gender: profile.sex,
                    picture: profile.headimgurl,
                  },
                },
                {
                  include: [
                    { model: UserLogin, as: 'logins' },
                    { model: UserClaim, as: 'claims' },
                    { model: UserProfile, as: 'profile' },
                  ],
                },
              );
              done(null, {
                id: user.id,
                email: user.email,
              });
            }
          }
        }
      };

      fooBar().catch(done);
    },
  ),
);

export default passport;
