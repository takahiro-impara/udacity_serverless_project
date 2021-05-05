// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = 'fvgs3ri72c'
const region = 'ap-northeast-1'
export const apiEndpoint = `https://${apiId}.execute-api.${region}.amazonaws.com/dev`

export const authConfig = {
  // TODO: Create an Auth0 application and copy values from it into this map
  domain: 'koichi-auth0.jp.auth0.com',            // Auth0 domain
  clientId: 'Lm9XcEG3XIP0NaNOMcQVe3uc9vkKjm7P',          // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}
