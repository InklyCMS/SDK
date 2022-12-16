import { InklyAuth, InklyActivity, InklyAccount, InklyConnection } from "../dist";

const authLink = await InklyAuth.generateInklyAuthLink({
	expiry: new Date(Date.now() + (60_000 * 5)), // expires in 5 min
	appIdentifier: 'application-identifier',
	callbackUrl: 'http://localhost:3000/api/authCallback',
	endpoint: 'inkly.example.com', // defaults to connect.withinkly.io
});

// visit authLink

declare const authToken:string;

const session = await InklyActivity.createSession({
	authToken: authToken,
	endpoint: 'inkly.example.com', // defaults to connect.withinkly.io
});

const userAccount = await InklyAccount.getDetails({
	authToken: session.authToken,
	endpoint: 'inkly.example.com', // defaults to connect.withinkly.io
});

const success = await InklyAccount.signOut({
	authToken: session.authToken,
	endpoint: 'inkly.example.com', // defaults to connect.withinkly.io
}); // logs users out

const project = await InklyActivity.createProject({
	authToken: session.authToken,
	endpoint: 'inkly.example.com', // defaults to connect.withinkly.io
});

const inklyProject = new InklyConnection({
	endpoint: 'inkly.example.com', // defaults to connect.withinkly.io
	projectId: project.id,
	authToken: session.authToken
});

const details = await inklyProject.getAccessDetails();

details.tier

const articlesTable = inklyProject.content('post');

const article = await articlesTable.getFirstWhere({
	slug: 'my-article'
});