
export type InklyAuthResponse = {
	allow: boolean,
	expose?: boolean, // whether to return the authToken in the callbackUrl
	reason?: string // a reason for why allow was set to false
}

export type InklyAuthLinkGenerationResponse = {
	link: string,
    expiryISO: string
}

export type InklySession = {
	isValid: boolean;
	authToken: string;
	appIdentifier: string;
	expiry: Date;
	id: string;
}

export interface IInklyAccount {
	id: string,
	firstName: string,
	lastName?: string,
	email?: string,
	username: string,
	createdAt: Date,
	banned?: {
		until?: Date,
		reason: string
	},
	accessibleProjects: Array<{
		id: string,
		fullName: string,
		iconPath?: string
	}>
}

export type InklyAccessDetails = {
	tier: "FREE" | "EDU" | "PRO",
	projectId: string,
	accessGroups: Array<string>,
	appIdentifier: string,
	accessKey: string,
	featureGroups: Array<string>,
	accessLevel: number,
	softLimits: Array<{
		key: string,
		value: any
	}>
}

export interface IInklyFetcher<T> {
    getAll():Promise<Array<T>>
    getAllWhere(where:InklyWhere<T>):Promise<Array<T>>
    getFirstWhere(where:InklyWhere<T>):Promise<T>
    getById(id:string):Promise<T>
}

type InklyWhereCondition<T, VType = T[keyof Partial<T>]> = {
    _operator: string,
    _value: VType
} | InklyWhereObj<VType> | Partial<VType>;

export type InklyWhereObj<T> = {
    [Field in keyof Partial<T>]: InklyWhereCondition<T>
}

export type InklyWhere<T> = InklyWhereObj<T> | Array<InklyWhereObj<T>>;