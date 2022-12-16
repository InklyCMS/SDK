import { describe, expect, test } from "vitest";
import { serializeWhereCondition } from "./condition";

type Dummy = {
    firstName: string,
    lastName: string,
    age: number,
    bio: string,
    meta: {
        hp: number,
        mp: number
    },
    isBanned: boolean
}

describe("condition", ()=>{

    test("parseWhereCondition", ()=>{

        expect(
            serializeWhereCondition({
                firstName: "dan",
                lastName: "doe"
            })
        ).toEqual(`"firstName"="dan"&"lastName"="doe"`);

        expect(
            serializeWhereCondition<Dummy>([
                {firstName: "john", lastName: "doe", age: {_operator:"gt", _value:50}},
                {firstName: "jane", lastName: "doe"}
            ])
        ).toEqual(`("firstName"="john"&"lastName"="doe"&"age">50)|("firstName"="jane"&"lastName"="doe")`);

        expect(
            serializeWhereCondition<Dummy>([
                {lastName: "doe", age: {_operator:"gt", _value:50}},
                {lastName: "doe", isBanned: false},
                {lastName: "doe", bio: `This is my bio "hello world"`}
            ])
        ).toEqual(`("lastName"="doe"&"age">50)|("lastName"="doe"&"isBanned"=false)|("lastName"="doe"&"bio"="This%20is%20my%20bio%20%22hello%20world%22")`);

        expect(
            serializeWhereCondition<Dummy>([
                {lastName: "oliver", age: {_operator: "lt", _value:25}},
                {
                    lastName: "oliver", 
                    meta: {
                        hp: {
                            _operator: "lt",
                            _value: 12
                        }
                    }
                }
            ])
        ).toEqual(`("lastName"="oliver"&"age"<25)|("lastName"="oliver"&"meta.hp"<12)`);

    })

})