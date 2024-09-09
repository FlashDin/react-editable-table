import React, {useState} from 'react';
import EditableTable from './components/editable-table/EditableTable';

const data = [
    {id: 1, name: 'John Doe', email: 'john@example.com'},
    {id: 2, name: 'Jane Smith', email: 'jane@example.com'},
    {id: 3, name: 'Alice Johnson', email: 'alice@example.com'},
];

const rowHeights = {
    0: 100,
    1: 100,
    2: 100,
};


const columns = [
    {
        key: "id",
        label: "ID",
        size: 100,
    },
    {
        key: "name",
        label: "NAME",
        size: 200,
    },
    {
        key: "email",
        label: "EMAIL",
        size: 250,
    }
];

const App: React.FC = () => {

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Editable Table</h1>
            <div className="w-full h-screen">
                <EditableTable columns={columns}
                               data={data}
                               rowHeights={rowHeights}
                />
            </div>
        </div>
    );
};

export default App;
