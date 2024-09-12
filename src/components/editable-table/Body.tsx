import React, {useState, ChangeEvent, useRef, useEffect, useCallback} from 'react';
import {Col, RowHeight} from "../../types/type";

interface Props {
    columns: Array<Col>;
    data: Array<any>;
    // setData: React.Dispatch<React.SetStateAction<Array<any>>>;
    rowHeights: RowHeight;
    // setRowHeights: React.Dispatch<React.SetStateAction<Array<any>>>;
}

interface CopasVal {
    key: string;
    row: number;
    value: any;
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

    const [selectedBeforeCells, setSelectedBeforeCells] = useState<Set<string>>(new Set());
    const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set());
    const [isCellSelecting, setIsCellSelecting] = useState(false);
    const startCellRef = useRef<string | null>(null);
    const [copiedCellContent, setCopiedCellContent] = useState<CopasVal | null>(null);
    const [cutCellContent, setCutCellContent] = useState<CopasVal | null>(null);

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
        window.getSelection()?.removeAllRanges();
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
                }
                return newSelection;
            });
        }
    }, [isCellSelecting]);

    const handleCellKeyDown = useCallback((cellId: string, content: CopasVal, event: React.KeyboardEvent) => {
        if ((event.ctrlKey || event.metaKey) && event.key === 'x') {
            event.preventDefault();
            handleCellCut(cellId, content);
        } else if ((event.ctrlKey || event.metaKey) && event.key === 'c') {
            event.preventDefault();
            handleCellCopy(cellId, content);
        } else if (event.key === 'Escape') {
            event.preventDefault();
            handleCleanClipboard();
        }
    }, []);

    const handleCellContextMenu = useCallback((cellId: string, content: CopasVal, event: React.MouseEvent) => {
        event.preventDefault();
        // if (event.ctrlKey || event.metaKey) { // Ctrl + Click or Cmd + Click for cut
        //     handleCellCut(cellId, content);
        // } else { // Right-click to copy
        //     handleCellCopy(cellId, content);
        // }
    }, []);

    const handleCellCopy = (cellId: string, content: CopasVal) => {
        handleCleanClipboard();
        setSelectedBeforeCells(prevState => {
            const newSelection = new Set(prevState);
            newSelection.add(cellId);
            return newSelection;
        });
        setCutCellContent(null);
        setCopiedCellContent(content);
    };

    const handleCellCut = (cellId: string, content: CopasVal) => {
        handleCleanClipboard();
        setSelectedBeforeCells(prevState => {
            const newSelection = new Set(prevState);
            newSelection.add(cellId);
            return newSelection;
        });
        setCopiedCellContent(null);
        setCutCellContent(content);
    };

    const handleCleanClipboard = () => {
        setSelectedBeforeCells(new Set());
        setCutCellContent(null);
        setCopiedCellContent(null);
    };

    const handleCellPaste = useCallback((cellId: string) => {
        if (copiedCellContent || cutCellContent) {
            setDt(prevData => {
                const newData = prevData;
                const cellIds = cellId.split('-');
                const rowIndex: number = Number(cellIds[0]);
                const cellKey: string = cellIds[1];
                if (cutCellContent) {
                    newData[cutCellContent.row][cutCellContent.key] = '';
                    newData[rowIndex][cellKey] = cutCellContent.value;
                    handleCleanClipboard();
                } else if (copiedCellContent) {
                    newData[rowIndex][cellKey] = copiedCellContent.value;
                    setCopiedCellContent(prevState => {
                        if (prevState !== null) {
                            return {
                                key: prevState.key,
                                row: prevState.row,
                                value: prevState.value,
                            };
                        }
                        return null;
                    });
                }
                return newData;
            });
        }
    }, [copiedCellContent, cutCellContent]);

    useEffect(() => {
        const handleCellKeyDown = (event: KeyboardEvent) => {
            if ((event.ctrlKey || event.metaKey) && event.key === 'v') { // Ctrl+V or Cmd+V
                event.preventDefault();
                selectedCells.forEach((v: string) => {
                    handleCellPaste(v);
                });
            }
        };

        document.addEventListener('keydown', handleCellKeyDown);
        return () => {
            document.removeEventListener('keydown', handleCellKeyDown);
        };
    }, [selectedCells, copiedCellContent, cutCellContent, handleCellPaste]);

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
                    const cellId: string = `${rowIndex}-${column.key}`;
                    return (
                        <td id={cellId} key={cellId}
                            className={`${selectedCells.has(cellId) ? 'border-blue-400 border-2' : (selectedBeforeCells.has(cellId) && (copiedCellContent || cutCellContent)) ? 'border-dashed border-blue-400 border-2' : 'border-gray-300 border'}`}
                            onMouseDown={() => handleCellMouseDown(cellId)}
                            onMouseEnter={() => handleCellMouseEnter(cellId)}
                            onMouseUp={handleCellMouseUp}
                            onClick={() => handleCellClick(cellId)}
                            onContextMenu={(e) => handleCellContextMenu(cellId, {
                                key: column.key,
                                row: rowIndex,
                                value: row[column.key]
                            }, e)}
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
                                        className="w-full py-2 px-4 outline-none resize-none"
                                        style={{height: `${rh[rowIndex] || 40}px`}}
                                        onKeyDown={(e) => handleCellKeyDown(cellId, {
                                            key: column.key,
                                            row: rowIndex,
                                            value: row[column.key]
                                        }, e)}
                                        tabIndex={0}
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
