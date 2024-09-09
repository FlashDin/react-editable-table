import React, {useState, useEffect} from 'react';
import {Col} from "../../types/type";

interface Props {
    columns: Array<Col>;
    // setColumns: React.Dispatch<React.SetStateAction<Array<any>>>;
}

const Header: React.FC<Props> = ({columns}) => {

    const [cols, setCols] = useState<Array<Col>>([]); // Track dragged column
    const [draggedColIndex, setDraggedColIndex] = useState<number | null>(null); // Track dragged column
    const [isDraggingColumn, setIsDraggingColumn] = useState<boolean>(false); // Track if row is being dragged

    const [isDraggingColumnResize, setIsDraggingColumnResize] = useState<string | null>(null);
    const [draggingStartX, setDraggingStartX] = useState<number | null>(null);
    const [draggingColumnWidth, setDraggingColumnWidth] = useState<number | null>(null);

    useEffect(() => {
        setCols(columns);
    }, [columns]);

    // Drag event handlers
    const handleColumnDragStart = (index: number) => {
        setDraggedColIndex(index);
        setIsDraggingColumn(true);
    };

    const handleColumnDragOver = (e: React.DragEvent<HTMLTableHeaderCellElement>) => {
        e.preventDefault(); // Necessary to allow dropping
    };

    const handleColumnDrop = (dropIndex: number) => {
        if (draggedColIndex === null) return;

        const newColumns: any = [...cols];
        const draggedCol = newColumns[draggedColIndex];

        // Remove dragged column and insert it at the new position
        newColumns.splice(draggedColIndex, 1); // Remove from old position
        newColumns.splice(dropIndex, 0, draggedCol); // Insert at new position

        setCols(newColumns);
        setDraggedColIndex(null); // Reset drag index
        setIsDraggingColumn(false); // Reset dragging state
    };

    const handleColumnMouseUp = () => {
        setIsDraggingColumn(false); // Reset dragging state on mouse release
    };

    const handleColumnMouseDown = () => {
        setIsDraggingColumn(true); // Reset dragging state on mouse release
    };

    // Resizable column functions
    const handleColumnMouseDownResize = (e: React.MouseEvent<HTMLDivElement>, index: number) => {
        setIsDraggingColumnResize(cols[index].key);
        setDraggingStartX(e.clientX);
        setDraggingColumnWidth(cols[index].size);

    };

    const handleColumnMouseMoveResize = (e: MouseEvent) => {
        if (!isDraggingColumnResize || draggingStartX === null || draggingColumnWidth === null) return;

        const deltaX = e.clientX - draggingStartX;
        const newWidth = draggingColumnWidth + deltaX;

        setCols((prev: Array<Col>) => ([
            ...prev.map((v: any) => {
                if (v.key === isDraggingColumnResize) {
                    v.size = newWidth;
                }
                return v;
            }),
        ]));
    };

    const handleColumnMouseUpResize = () => {
        setIsDraggingColumnResize(null);
        setDraggingStartX(null);
        setDraggingColumnWidth(null);
    };

    useEffect(() => {
        setIsDraggingColumnResize(null);
        if (isDraggingColumn) {
            document.addEventListener('mouseup', handleColumnMouseUp);
            document.addEventListener('mousedown', handleColumnMouseDown);
        }
        return () => {
            document.removeEventListener('mousemove', handleColumnMouseMoveResize);
            document.removeEventListener('mouseup', handleColumnMouseUpResize);
            document.removeEventListener('mouseup', handleColumnMouseUp);
            document.removeEventListener('mousedown', handleColumnMouseDown);
        };
    }, [isDraggingColumn]);

    useEffect(() => {
        setIsDraggingColumn(false);
        if (isDraggingColumnResize) {
            document.addEventListener('mousemove', handleColumnMouseMoveResize);
            document.addEventListener('mouseup', handleColumnMouseUpResize);
        }
        return () => {
            document.removeEventListener('mousemove', handleColumnMouseMoveResize);
            document.removeEventListener('mouseup', handleColumnMouseUpResize);
            document.removeEventListener('mouseup', handleColumnMouseUp);
            document.removeEventListener('mousedown', handleColumnMouseDown);
        };
    }, [isDraggingColumnResize]);

    return (
        <thead>
        <tr>
            <th className={`border border-gray-300 bg-gray-200 text-center cursor-default`}>#</th>
            {cols.map((column: any, index: number) => (
                <th
                    key={column.key}
                    draggable={!isDraggingColumnResize}
                    onDragStart={() => {
                        if (!isDraggingColumnResize) {
                            handleColumnDragStart(index)
                        }
                    }}
                    onDragOver={(e: React.DragEvent<HTMLTableHeaderCellElement>) => {
                        if (!isDraggingColumnResize) {
                            handleColumnDragOver(e);
                        }
                    }}
                    onDrop={() => {
                        if (!isDraggingColumnResize) {
                            handleColumnDrop(index);
                        }
                    }}
                    className={`border border-gray-300 bg-gray-200 text-left ${isDraggingColumn ? 'cursor-grabbing' : 'cursor-default'}`}
                >
                    <div className={'flex justify-between'}>
                        <div className={'py-3 px-4'} style={{width: `${column.size}px`}}>{column.label}</div>
                        <div
                            className="inline-block cursor-col-resize min-h-max w-1"
                            onMouseDown={(e) => handleColumnMouseDownResize(e, index)}
                        />
                    </div>
                </th>
            ))}
            <th className={'invisible'}>-</th>
        </tr>
        </thead>
    );
};

export default Header;
