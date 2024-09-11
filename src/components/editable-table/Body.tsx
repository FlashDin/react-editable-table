import React, {useState, ChangeEvent, useRef, useEffect, useCallback} from 'react';
import {Col, RowHeight} from "../../types/type";

interface Props {
    columns: Array<Col>;
    data: Array<any>;
    // setData: React.Dispatch<React.SetStateAction<Array<any>>>;
    rowHeights: RowHeight;
    // setRowHeights: React.Dispatch<React.SetStateAction<Array<any>>>;
}

const Body: React.FC<Props> = ({columns, data, rowHeights}) => {

    const [cols, setCols] = useState<Array<Col>>([]);
    const [dt, setDt] = useState<Array<any>>([]);
    const [rh, setRh] = useState<RowHeight>({});

    const [editIndex, setEditIndex] = useState<number | null>(null);
    const [editKey, setEditKey] = useState<any>(null);
    const [editValue, setEditValue] = useState<string>('');

    const inputRef = useRef<HTMLTextAreaElement | null>(null);

    const [draggedRowIndex, setDraggedRowIndex] = useState<number | null>(null); // Track dragged row
    const [draggedRowIndexResize, setDraggedRowIndexResize] = useState<number | null>(null); // Track dragged row
    const [isDraggingRow, setIsDraggingRow] = useState<boolean>(false); // Track if row is being dragged
    const [isDraggingRowResize, setIsDraggingRowResize] = useState<boolean>(false); // Track if row is being dragged
    const [draggingRowStartY, setDraggingRowStartY] = useState<number | null>(null);
    const [draggingRowHeight, setDraggingRowHeight] = useState<number | null>(null);

    const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set());
    const [isCellSelecting, setIsCellSelecting] = useState(false);
    const startCellRef = useRef<string | null>(null);

    useEffect(() => {
        setCols(columns);
    }, [columns]);

    useEffect(() => {
        setDt(data);
    }, [data]);

    useEffect(() => {
        setRh(rowHeights);
    }, [rowHeights]);

    useEffect(() => {
        if (editKey && inputRef.current && editIndex !== null) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [editIndex, editKey]);

    const handleEdit = (index: number, key: any, value: string) => {
        const newData: any = [...dt]; // Using 'any' for newData allows for flexibility
        newData[index][key] = value; // Update the specific field
        setDt(newData); // Cast the updated array back to TableRow[]
    };

    const handleKeyPress = (index: number, key: any, e: any) => {
        if (e.key === 'Enter' && e.shiftKey === false) {
            handleBlur(index, key, e);
        }
    };

    const handleChange = (index: number, key: any, e: ChangeEvent<HTMLTextAreaElement>) => {
        setEditValue(e.target.value);
        if (editIndex === null) {
            setEditIndex(index);
            setEditKey(key);
        }
    };

    const handleBlur = (index: number, key: any, e: any) => {
        handleEdit(index, key, editValue);
        setEditIndex(null);
        setEditKey(null);
        setEditValue('');
        const target = e.target;
        target.parentNode.classList.remove('border-blue-400', 'border-2');
        target.parentNode.classList.add('border-gray-300');
    };

    const isEditing = (index: number, key: any) => index === editIndex && key === editKey;
    const handleIsEditing = (e: any, index: number, column: any, row: any) => {
        setEditIndex(index);
        setEditKey(column.key);
        setEditValue(String(row[column.key]));
        const target = e.target;
        target.parentNode.classList.remove('border-gray-300');
        target.parentNode.classList.add('border-blue-400', 'border-2');
    };

    // Drag event handlers for rows
    const handleRowDragStart = (index: number) => {
        setDraggedRowIndex(index);
        setIsDraggingRow(true);
    };

    const handleRowDragOver = (e: React.DragEvent<HTMLTableCellElement>) => {
        e.preventDefault(); // Necessary to allow dropping
    };

    const handleRowDrop = (dropIndex: number) => {
        if (draggedRowIndex === null || draggedRowIndex === dropIndex) return;

        const newData = [...dt];
        const draggedRow = newData[draggedRowIndex];

        // Remove the dragged row and insert it at the new position
        newData.splice(draggedRowIndex, 1); // Remove from old position
        newData.splice(dropIndex, 0, draggedRow); // Insert at new position

        setDt(newData);
        setRh((prevHeights) => ({
            ...prevHeights,
            [dropIndex]: rh[draggedRowIndex],
            [draggedRowIndex]: rh[dropIndex],
        }));
        setIsDraggingRow(false); // Reset dragging state
        setDraggedRowIndex(null); // Reset drag index
    };

    const handleRowMouseUp = () => {
        setIsDraggingRow(true); // Reset dragging state on mouse release
        setIsDraggingRow(false); // Reset dragging state on mouse release
    };

    // Resizable row functions
    const handleRowMouseDownResize = (e: React.MouseEvent<HTMLDivElement>, rowIndex: number) => {
        setIsDraggingRowResize(true);
        setDraggedRowIndexResize(rowIndex);
        setDraggingRowStartY(e.clientY);
        setDraggingRowHeight(rh[rowIndex]);
    };

    const handleRowMouseMoveResize = (e: MouseEvent) => {
        if (draggedRowIndexResize === null || draggingRowStartY === null || draggingRowHeight === null) return;
        const deltaY = e.clientY - draggingRowStartY;
        const newHeight = draggingRowHeight + deltaY;
        setRh((prevHeights) => ({
            ...prevHeights,
            [draggedRowIndexResize]: newHeight
        }));
    };

    const handleRowMouseUpResize = () => {
        setIsDraggingRowResize(false);
        setDraggingRowStartY(null);
        setDraggingRowHeight(null);
        setDraggedRowIndexResize(null);
    };

    useEffect(() => {
        setIsDraggingRowResize(false);
        if (isDraggingRowResize) {
            document.addEventListener('mouseup', handleRowMouseUp);
        }
        return () => {
            document.removeEventListener('mousemove', handleRowMouseMoveResize);
            document.removeEventListener('mouseup', handleRowMouseUpResize);
            document.removeEventListener('mouseup', handleRowMouseUp);
        };
    }, [isDraggingRow]);

    useEffect(() => {
        setIsDraggingRow(false);
        if (isDraggingRowResize) {
            document.addEventListener('mousemove', handleRowMouseMoveResize);
            document.addEventListener('mouseup', handleRowMouseUpResize);
        }

        return () => {
            document.removeEventListener('mousemove', handleRowMouseMoveResize);
            document.removeEventListener('mouseup', handleRowMouseUpResize);
            document.removeEventListener('mouseup', handleRowMouseUp);
        };
    }, [isDraggingRowResize]);

    const handleCellMouseDown = useCallback((cellId: string) => {
        setIsCellSelecting(true);
        startCellRef.current = cellId;

        if ((window.event as KeyboardEvent)?.shiftKey) {
            // If Shift key is pressed, start a selection range
            setSelectedCells(prev => {
                const newSelection = new Set(prev);
                if (newSelection.has(cellId)) {
                    newSelection.delete(cellId); // Unselect cell if it's already selected
                } else {
                    newSelection.add(cellId); // Select cell
                }
                return newSelection;
            });
        } else {
            // Otherwise, clear selection and select this cell
            setSelectedCells(new Set([cellId]));
        }
    }, []);

    const handleCellMouseEnter = useCallback((cellId: string) => {
        if (isCellSelecting && startCellRef.current) {
            const newSelection = new Set<string>(selectedCells);
            // For simplicity, we add all hovered cells to selection
            newSelection.add(cellId);
            setSelectedCells(newSelection);
        }
    }, [isCellSelecting, selectedCells]);

    const handleCellMouseUp = useCallback(() => {
        setIsCellSelecting(false);
    }, []);

    useEffect(() => {
        // Add event listener to handle mouse release outside table
        document.addEventListener('mouseup', handleCellMouseUp);
        return () => {
            document.removeEventListener('mouseup', handleCellMouseUp);
        };
    }, [handleCellMouseUp]);

    const handleCellClick = useCallback((cellId: string) => {
        if (!isCellSelecting) {
            // Handle single cell selection/deselection
            setSelectedCells(prev => {
                const newSelection = new Set(prev);
                if (newSelection.has(cellId)) {
                    newSelection.add(cellId); // Select cell
                } else {
                    newSelection.delete(cellId); // Deselect cell
                }
                return newSelection;
            });
        }
    }, [isCellSelecting]);

    return (
        <tbody>
        {dt.map((row, rowIndex) => (
            <tr key={rowIndex}>
                <td key={rowIndex}
                    draggable={!isDraggingRowResize}
                    onDragStart={() => {
                        if (!isDraggingRowResize) {
                            handleRowDragStart(rowIndex);
                        }
                    }}
                    onDragOver={(e) => {
                        if (!isDraggingRowResize) {
                            handleRowDragOver(e);
                        }
                    }}
                    onDrop={() => {
                        if (!isDraggingRowResize) {
                            handleRowDrop(rowIndex);
                        }
                    }}
                    className={`border border-gray-300 bg-gray-200 text-center ${isDraggingRow ? 'cursor-grabbing' : 'cursor-default'}`}
                    style={{height: `${rh[rowIndex] || 40}px`}}
                >
                    <>
                        <div
                            className="w-full py-2 px-4"
                            style={{height: `${rh[rowIndex] || 40}px`}}
                        >
                            {1 + rowIndex}
                        </div>
                        <div
                            className="block cursor-row-resize w-full h-1"
                            onMouseDown={(e) => handleRowMouseDownResize(e, rowIndex)}
                        />
                    </>
                </td>
                {cols.map((column: Col, cellIndex: number) => {
                    const cellId: string = `${rowIndex}-${cellIndex}`;
                    return (
                        <td key={cellId}
                            className={`${selectedCells.has(cellId) ? 'border-blue-400 border-2' : 'border-gray-300 border'}`}
                            onMouseDown={() => handleCellMouseDown(cellId)}
                            onMouseEnter={() => handleCellMouseEnter(cellId)}
                            onMouseUp={handleCellMouseUp}
                            onClick={() => handleCellClick(cellId)}
                        >
                            {isEditing(rowIndex, column.key) ? (
                                <textarea
                                    value={editValue}
                                    onChange={(e) => handleChange(rowIndex, column.key, e)}
                                    onKeyPress={(e) => handleKeyPress(rowIndex, column.key, e)}
                                    onBlur={(e) => handleBlur(rowIndex, column.key, e)}
                                    className="w-full py-2 px-4 outline-none"
                                    ref={inputRef}
                                    style={{height: `${rh[rowIndex] || 40}px`}}
                                />
                            ) : (
                                <>
                                    <div
                                        onDoubleClick={(e) => handleIsEditing(e, rowIndex, column, row)}
                                        className="w-full py-2 px-4 hover:bg-gray-100 whitespace-pre-line"
                                        style={{height: `${rh[rowIndex] || 40}px`}}
                                    >
                                        {row[column.key]}
                                    </div>
                                </>
                            )}
                        </td>
                    );
                })}
            </tr>
        ))}
        </tbody>
    );
};

export default Body;
