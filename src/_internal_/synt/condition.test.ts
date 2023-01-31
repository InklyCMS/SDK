import { describe, expect, test } from "vitest";
import {deserializeWhereCondition, op, serializeWhereCondition} from "./condition";

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
        ).toEqual(`'firstName'="dan"&'lastName'="doe"`);

        expect(
            serializeWhereCondition<Dummy>([
                {firstName: "john", lastName: "doe", age: op.lessThan(50)},
                {firstName: "jane", lastName: "doe"}
            ])
        ).toEqual(`('firstName'="john"&'lastName'="doe"&'age'<50)|('firstName'="jane"&'lastName'="doe")`);

        expect(
            serializeWhereCondition<Dummy>([
                {lastName: "doe", age: op.greaterThan(50)},
                {lastName: "doe", isBanned: false},
                {lastName: "doe", bio: `This is my bio "hello world"`}
            ])
        ).toEqual(`('lastName'="doe"&'age'>50)|('lastName'="doe"&'isBanned'=false)|('lastName'="doe"&'bio'="This%20is%20my%20bio%20%22hello%20world%22")`);

        expect(
            serializeWhereCondition<Dummy>([
                {lastName: "oliver", age: op.lessThanOrEquals(25)},
                {
                    lastName: "oliver", 
                    meta: {
                        hp: op.greaterThanOrEquals(12)
                    }
                }
            ])
        ).toEqual(`('lastName'="oliver"&'age'<=25)|('lastName'="oliver"&'meta.hp'>=12)`);

    });

    test("deserializeWhere", ()=>{

        expect(
            deserializeWhereCondition(`'firstName'="dan"`)
        ).toEqual(
            [[{operation:'=', left:'field(firstName)', right:'string(dan)'}]]
        );

        expect(
            deserializeWhereCondition(`'firstName'="dan"&'lastName'="doe"`)
        ).toEqual(
            [
                [
                    {operation:'=', left:'field(firstName)', right:'string(dan)'},
                    {operation:'=', left:'field(lastName)', right:'string(doe)'}
                ]
            ]
        );

        expect(
            deserializeWhereCondition(`'interests'<-"gaming"`)
        ).toEqual(
            [[{operation:'<-', left:'field(interests)', right:'string(gaming)'}]]
        );

        expect(
            deserializeWhereCondition(`('lastName'="oliver"&'age'<=25)|('lastName'="oliver"&'meta.hp'>=12)`)
        ).toEqual(
            [
                [
                    {operation:'=', left:'field(lastName)', right:'string(oliver)'},
                    {operation:'<=', left:'field(age)', right:'number(25)'}
                ],
                [
                    {operation:'=', left:'field(lastName)', right:'string(oliver)'},
                    {operation:'>=', left: 'field(meta.hp)', right:'number(12)'}
                ]
            ]
        );

        expect(
            deserializeWhereCondition(`('lastName'="doe"&'age'>50)|('lastName'="doe"&'isBanned'=false)|('lastName'="doe"&'bio'="This%20is%20my%20bio%20%22hello%20world%22")`)
        ).toEqual(
            [
                [
                    {operation:'=', left:'field(lastName)', right:'string(doe)'},
                    {operation:'>', left:'field(age)', right:'number(50)'}
                ],
                [
                    {operation:'=', left:'field(lastName)', right:'string(doe)'},
                    {operation:'=', left: 'field(isBanned)', right:'boolean(false)'}
                ],
                [
                    {operation:'=', left:'field(lastName)', right:'string(doe)'},
                    {operation:'=', left: 'field(bio)', right:'string(This is my bio "hello world")'}
                ]
            ]
        );

        expect( deserializeWhereCondition(undefined) ).toEqual(undefined);
        expect( deserializeWhereCondition(' ') ).toEqual(undefined);
        expect( deserializeWhereCondition(' a') ).toEqual(undefined);

    });

})