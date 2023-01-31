import { InklyAuth, InklyActivity, InklyAccount, InklyConnection } from "../dist";
import { ContentModel, InklyContentFetcher } from "../src/_internal_/connect";

const authLink = await InklyAuth.generateInklyAuthLink({
	expiry: new Date(Date.now() + (60_000 * 5)), // expires in 5 min
	appIdentifier: 'application-identifier',
	callbackUrl: 'http://localhost:3000/api/authCallback',
	endpoint: 'inkly.example.com', // defaults to connect.inkly.cc
});

// visit authLink

declare const authToken:string;

const session = await InklyActivity.createSession({
	authToken: authToken,
	endpoint: 'inkly.example.com', // defaults to connect.inkly.cc
});

const userAccount = await InklyAccount.getDetails({
	authToken: session.authToken,
	endpoint: 'inkly.example.com', // defaults to connect.inkly.cc
});

const success = await InklyAccount.signOut({
	authToken: session.authToken,
	endpoint: 'inkly.example.com', // defaults to connect.inkly.cc
}); // logs users out

const project = await InklyActivity.createProject({
	name: 'myProject',
	authToken: session.authToken,
	endpoint: 'inkly.example.com', // defaults to connect.inkly.cc
});

const inklyProject = new InklyConnection({
	endpoint: 'inkly.example.com', // defaults to connect.inkly.cc
	projectSlug: project.slug,
	authToken: session.authToken
});

const details = await inklyProject.getAccessDetails();

details.tier

// declare module "../dist" {
//     export class InklyConnection {
//         content(collectionName: "test") : InklyContentFetcher<ContentModel<{name: string}>>
//     }
// }

type MyTestContents = ContentModel<{slug: string, body: string}>;

const articlesTable = inklyProject.content<MyTestContents>('post');

const article = await articlesTable.getFirstWhere({
	slug: 'my-article'
});

