import React, {ReactNode, useRef, useCallback, useState, useEffect} from 'react';

interface ScrollComponentProps {
    children: ReactNode; // Accepts any React nodes as children
    onScrollXEnd: () => void; // Callback to load more data
    onScrollYEnd: () => void; // Callback to load more data
}

const ScrollComponent: React.FC<ScrollComponentProps> = ({children, onScrollXEnd, onScrollYEnd}) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    const [parentHeight, setParentHeight] = useState<number>(0);

    useEffect(() => {
        const elm = document.getElementById('scrollerz');

        // Check if the element exists
        if (elm) {
            const ph: number = elm.parentElement?.parentElement?.offsetHeight || 0;
            setParentHeight(ph);
        }
    }, []);

    const handleScroll = useCallback(() => {
        const container = scrollRef.current;
        if (container) {
            const {scrollLeft, scrollWidth, clientWidth} = container;
            if (scrollLeft + clientWidth >= scrollWidth - 10) { // Threshold to trigger load
                onScrollXEnd();
            }
            const {scrollTop, scrollHeight, clientHeight} = container;
            if (scrollTop + clientHeight >= scrollHeight - 10) { // Threshold to trigger load
                onScrollYEnd();
            }
        }
    }, [onScrollXEnd, onScrollYEnd]);

    const scrollLeft = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({
                left: -100, // Scroll left by 100px
                behavior: 'smooth', // Smooth scrolling
            });
        }
    };

    const scrollRight = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({
                left: 100, // Scroll right by 100px
                behavior: 'smooth', // Smooth scrolling
            });
        }
    };

    return (
        <div id="scrollerz" className="relative flex flex-col items-center space-y-4">
            <div
                ref={scrollRef}
                className="w-full overflow-scroll whitespace-nowrap border border-gray-400"
                style={{
                    height: parentHeight
                }}
                onScroll={handleScroll}
            >
                {children}
            </div>
            <div className="absolute -bottom-4 right-4 flex space-x-4">
                <button
                    onClick={scrollLeft}
                    className="px-4 py-2 bg-blue-400 text-white rounded hover:bg-blue-600"
                >
                    {'<'}
                </button>
                <button
                    onClick={scrollRight}
                    className="px-4 py-2 bg-blue-400 text-white rounded hover:bg-blue-600"
                >
                    {'>'}
                </button>
            </div>
        </div>
    );
};

export default ScrollComponent;
