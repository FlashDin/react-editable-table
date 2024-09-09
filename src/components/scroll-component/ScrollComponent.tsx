import React, {ReactNode, useEffect, useRef, useState} from 'react';

interface ScrollComponentProps {
    children: ReactNode; // Accepts any React nodes as children
}

const ScrollComponent: React.FC<ScrollComponentProps> = ({ children }) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    const [parentHeight, setParentHeight] = useState<number>(0);

    useEffect(() => {
        const elm = document.getElementById('scrollerz');

        // Check if the element exists
        if (elm) {
            const ph: number = elm.parentElement?.offsetHeight || 0;
            setParentHeight(ph);
        }
    }, []);

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
