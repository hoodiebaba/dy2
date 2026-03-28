const CustomTooltip = ({ text, children }) => {

    return (
        <div className="">
            <div className="group flex flex-col relative items-center w-full mr-2">
                <p className='cursor-pointer text-center' onClick={() => { }}>{children}</p>
                <span className="pointer-events-none w-max absolute -top-8 bg-secLine z-[100px] rounded-lg p-2 opacity-0 transition-opacity group-hover:opacity-100">
                    {text}
                </span>
            </div>
        </div>

    )
}

export default CustomTooltip



// const CustomTooltip = ({ active, payload, label }) => {
//     if (active && payload && payload.length) {
//         const formattedTimestamp = new Date(label).toLocaleString();

//         return (
//             <span className="custom-tooltip bg-white p-2 inline-block">
//                 <div>{formattedTimestamp}</div>
//                 {payload.map((entry, index) => (
//                     <div key={`value-${index}`} style={{ color: entry.color }}>
//                         {entry.name}: {entry.value}
//                     </div>
//                 ))}
//             </span>
//         );
//     }
//     return null;
// };

