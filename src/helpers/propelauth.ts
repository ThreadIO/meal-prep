import { handleError, initBaseAuth } from "@propelauth/node";

export const propelauth = initBaseAuth({
  authUrl: process.env.NEXT_PUBLIC_AUTH_URL || "default_auth_url",
  apiKey: process.env.PROPELAUTH_API_KEY || "default_api_key",
  manualTokenVerificationMetadata: {
    verifierKey: process.env.PROPELAUTH_VERIFIER_KEY || "default_verifier_key",
    issuer: process.env.NEXT_PUBLIC_AUTH_URL || "default_auth_url",
  },
});

export async function validateUser(req: any, res: any) {
  try {
    console.log("Auth url: ", process.env.NEXT_PUBLIC_AUTH_URL);
    console.log("Api key: ", process.env.PROPELAUTH_API_KEY);
    console.log("Verifier key: ", process.env.PROPELAUTH_VERIFIER_KEY);
    console.log("Auth header: ", req.headers.authorization);

    return await propelauth.validateAccessTokenAndGetUser(
      req.headers.authorization
    );
  } catch (e) {
    let err = handleError(e, {
      logError: true,
      returnDetailedErrorToUser: false,
    });
    res.status(err.status).send(err.message);
  }
}

export async function validateUserIsInOrgByPathParam(req: any, res: any) {
  try {
    return await propelauth.validateAccessTokenAndGetUserWithOrgInfo(
      req.headers.authorization,
      { orgId: req.query.orgId }
    );
  } catch (e) {
    let err = handleError(e, {
      logError: true,
      returnDetailedErrorToUser: false,
    });
    res.status(err.status).send(err.message);
  }
}
