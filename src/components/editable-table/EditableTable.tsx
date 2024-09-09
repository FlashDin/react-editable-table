import React, {useState, ChangeEvent, KeyboardEvent, useRef, useEffect} from 'react';
import Header from "./Header";
import Body from "./Body";
import generateAlphabets from "../../functions/GenerateAlphabet";
import {Col, RowHeight} from "../../types/type";
import ScrollComponent from "../scroll-component/ScrollComponent";

interface Props {
    columns: Array<Col>;
    data: Array<any>;
    rowHeights: { [key: number]: number };
}

const EditableTable: React.FC<Props> = ({columns, data, rowHeights}) => {

    const alphabets: Array<Col> = generateAlphabets("A", "Z").map((v: string) => ({
        key: v,
        label: v,
        size: 100
    }));

    const numbers: RowHeight = Array.from({length: 100}, (_, i) => i)
        .map((v: number) => ({
            [v]: rowHeights[v],
        }))
        .reduce((acc, item, i) => {
            acc[i] = item[i]; // Or set any value you need
            return acc;
        }, {});

    const dataSize = data.length;

    const mData: Array<any> = Object.keys(numbers)
        .map((v: string, i: number) => {
            const res = alphabets.reduce((acc, item) => {
                acc[item.key] = '';
                return acc;
            }, {} as any);
            if (i === 0) {
                columns.forEach((v, i) => {
                    res[alphabets[i].key] = v.label;
                });
            } else if (i <= dataSize) {
                const currentData = data[i - 1];
                Object.keys(currentData).forEach((v, i) => {
                    res[alphabets[i].key] = currentData[v];
                });
            }
            return res;
        });

    return (
        <ScrollComponent>
            <table className="border-collapse border border-gray-400">
                <Header columns={alphabets}/>
                <Body columns={alphabets} dataColumns={columns} data={mData} rowHeights={numbers}/>
            </table>
        </ScrollComponent>
    );
};

export default EditableTable;
