import React, {useState, ChangeEvent, KeyboardEvent, useRef, useEffect} from 'react';
import Header from "./Header";
import Body from "./Body";
import generateAlphabets, {getAlphabetFromCode} from "../../functions/GenerateAlphabet";
import {Col, RowHeight} from "../../types/type";
import ScrollComponent from "../scroll-component/ScrollComponent";

interface Props {
    columns: Array<Col>;
    data: Array<any>;
    rowHeights: { [key: number]: number };
}

const numberLimit: number = 100;
const alphabetLimit: number = 26;

const EditableTable: React.FC<Props> = ({columns, data, rowHeights}) => {

    const [loading, setLoading] = useState<boolean>(false);
    const [alphabets, setAlphabets] = useState<Array<Col>>([]);
    const [numbers, setNumbers] = useState<RowHeight>({});
    const [alphabetPage, setAlphabetPage] = useState<number>(1);
    const [numberPage, setNumberPage] = useState<number>(1);
    const [mData, setMData] = useState<Array<any>>([]);

    useEffect(() => {
    }, []);

    useEffect(() => {
        if (numberPage <= 5) {
            loadNumber(numberPage > 1);
        }
    }, [numberPage]);

    useEffect(() => {
        if (alphabetPage <= 5) {
            loadAlphabet(alphabetPage > 1);
        }
    }, [alphabetPage]);

    useEffect(() => {
        const dataSize = data.length;
        setMData(Object.keys(numbers)
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
            }));
    }, [numbers, alphabets]);

    const createAlphabet = () => {
        const start = ((alphabetPage - 1) * alphabetLimit) + 1;
        const stop = ((alphabetPage * alphabetLimit) - 1) + 1;
        const startAlphabet = getAlphabetFromCode(start);
        const endAlphabet = getAlphabetFromCode(stop);
        return generateAlphabets(startAlphabet, endAlphabet).map((v: string) => ({
            key: v,
            label: v,
            size: 100
        }));
    };

    const createNumber = () => {
        const step = 1;
        const start = (numberPage - 1) * numberLimit;
        const stop = (numberPage * numberLimit) - 1;
        return Array.from({length: (stop - start) / step + 1}, (_, i) => start + (i * step))
            .map((v: number) => ({
                [v]: rowHeights[v] || 20,
            }))
            .reduce((acc, item, i) => {
                acc[i + start] = item[i + start]; // Or set any value you need
                return acc;
            }, {});
    };

    const loadAlphabet = (more: boolean) => {
        if (loading) return; // Avoid multiple requests

        setLoading(true);
        // Simulate an API call
        const newAlphabets: Array<Col> = createAlphabet();
        setTimeout(() => {
            if (more) {
                setAlphabets((prevItems) => [
                    ...prevItems,
                    ...newAlphabets
                ]);
            } else {
                setAlphabets(newAlphabets);
            }
            setLoading(false);
        }, 1000); // Simulate a delay
    };

    const loadNumber = (more: boolean) => {
        if (loading) return; // Avoid multiple requests

        setLoading(true);
        // Simulate an API call
        const newNumbers = createNumber();
        setTimeout(() => {
            if (more) {
                setNumbers((prevItems) => ({
                    ...prevItems,
                    ...newNumbers
                }));
            } else {
                setNumbers(newNumbers);
            }
            setLoading(false);
        }, 1000); // Simulate a delay
    };

    return (
        <div className={'relative'}>
            {loading && <div
                className={'absolute w-full h-full pt-36 text-center text-white bg-black bg-opacity-50 z-40'}>Loading...</div>}
            <ScrollComponent onScrollXEnd={() => setAlphabetPage(prevState => (prevState + 1))}
                             onScrollYEnd={() => setNumberPage(prevState => (prevState + 1))}>
                <table className="border-collapse border border-gray-400">
                    <Header columns={alphabets}/>
                    <Body columns={alphabets} data={mData} rowHeights={numbers}/>
                </table>
            </ScrollComponent>
        </div>
    );
};

export default EditableTable;
