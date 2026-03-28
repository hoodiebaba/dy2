import React from 'react';
import Dragger from '../Dragger';
import CustomTooltip from '../CustomTooltip';

/**
 * CellInfoPopup
 * A reusable draggable popup for displaying cell/site info on a map.
 *
 * Props:
 *   data         {object}   - Key-value object to display in the table
 *   mapH         {string}   - Height of the map canvas (from smap.getCanvas().style.height)
 *   mapW         {string}   - Width of the map canvas (from smap.getCanvas().style.width)
 *   onClose      {func}     - Called when the close button is clicked
 *   onCopy       {func}     - Called with `data` when copy button is clicked
 *   onSiteAnalytics      {func}  - Called with `data` on click / right-click
 *   onCellAnalytics      {func}  - Called with `data` on click / right-click
 *   onSiteProRules       {func}  - Called with `data` on click / right-click
 *   onCellProRules       {func}  - Called with `data` on click / right-click
 *   onChartClick         {func}  - Called with `data` on left click (open modal)
 *   onChartRightClick    {func}  - Called with `data` on right click (open new tab)
 *
 * Usage:
 *   {showPopup && (
 *     <CellInfoPopup
 *       data={selectedCell}
 *       mapH={smap?.getCanvas()?.style.height}
 *       mapW={smap?.getCanvas()?.style.width}
 *       onClose={() => setShowPopup(false)}
 *       onCopy={(d) => copyToClipboard(d)}
 *       onSiteAnalytics={(d) => navigate('/site-analytics?id=' + d.Physical_id)}
 *       onCellAnalytics={(d) => navigate('/cell-analytics?id=' + d.Cell_name)}
 *       onSiteProRules={(d) => navigate('/site-pro-rules?id=' + d.Physical_id)}
 *       onCellProRules={(d) => navigate('/cell-pro-rules?id=' + d.Cell_name)}
 *       onChartClick={(d) => openDashboardModal(d)}
 *       onChartRightClick={(d) => window.open('/dashboard?cell=' + d.Cell_name, '_blank')}
 *     />
 *   )}
 */
const CellInfoPopup = ({
    data = {},
    mapH,
    mapW,
    onClose,
    onCopy,
    onSiteAnalytics,
    onCellAnalytics,
    onSiteProRules,
    onCellProRules,
    onChartClick,
    onChartRightClick,
}) => {
    return (
        <Dragger mapH={mapH} mapW={mapW}>
            <div className='bg-white w-auto h-auto absolute bottom-2'>

                {/* ── Action Bar ── */}
                <div className='flex bg-primaryLine h-10 justify-end items-center gap-1 px-2'>

                    {/* Copy */}
                    {onCopy && (
                        <CustomTooltip text="Click to copy.">
                            <div className='cursor-pointer' onClick={() => onCopy(data)}>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6 text-white">
                                    <path fillRule="evenodd" d="M17.663 3.118c.225.015.45.032.673.05C19.876 3.298 21 4.604 21 6.109v9.642a3 3 0 0 1-3 3V16.5c0-5.922-4.576-10.775-10.384-11.217.324-1.132 1.3-2.01 2.548-2.114.224-.019.448-.036.673-.051A3 3 0 0 1 13.5 1.5H15a3 3 0 0 1 2.663 1.618ZM12 4.5A1.5 1.5 0 0 1 13.5 3H15a1.5 1.5 0 0 1 1.5 1.5H12Z" clipRule="evenodd" />
                                    <path d="M3 8.625c0-1.036.84-1.875 1.875-1.875h.375A3.75 3.75 0 0 1 9 10.5v1.875c0 1.036.84 1.875 1.875 1.875h1.875A3.75 3.75 0 0 1 16.5 18v2.625c0 1.035-.84 1.875-1.875 1.875h-9.75A1.875 1.875 0 0 1 3 20.625v-12Z" />
                                    <path d="M10.5 10.5a5.23 5.23 0 0 0-1.279-3.434 9.768 9.768 0 0 1 6.963 6.963 5.23 5.23 0 0 0-3.434-1.279h-1.875a.375.375 0 0 1-.375-.375V10.5Z" />
                                </svg>
                            </div>
                        </CustomTooltip>
                    )}

                    {/* Site Analytics */}
                    {onSiteAnalytics && (
                        <CustomTooltip text="Click to go Site Analytics">
                            <div
                                className='cursor-pointer'
                                onClick={() => onSiteAnalytics(data)}
                                onContextMenu={(e) => { e.preventDefault(); onSiteAnalytics(data, 'newTab'); }}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-8 h-8 text-white" fill="currentColor">
                                    <circle cx="12" cy="10" r="1.6" />
                                    <path d="M11 12h2l1.6 8h-5.2L11 12z" />
                                    <path d="M7.8 9.5a5 5 0 0 0 0 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                                    <path d="M5.5 8a8 8 0 0 0 0 9" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                                    <path d="M16.2 9.5a5 5 0 0 1 0 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                                    <path d="M18.5 8a8 8 0 0 1 0 9" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                                </svg>
                            </div>
                        </CustomTooltip>
                    )}

                    {/* Cell Analytics */}
                    {onCellAnalytics && (
                        <CustomTooltip text="Click to go Cell Analytics">
                            <div
                                className='cursor-pointer'
                                onClick={() => onCellAnalytics(data)}
                                onContextMenu={(e) => { e.preventDefault(); onCellAnalytics(data, 'newTab'); }}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="w-8 h-8 text-white">
                                    <path d="M12 6C8.6 6 5.4 7.5 3 9.9L12 19l9-9.1C18.6 7.5 15.4 6 12 6Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                                </svg>
                            </div>
                        </CustomTooltip>
                    )}

                    {/* Site Pro Rules */}
                    {onSiteProRules && (
                        <CustomTooltip text="Click to go Site Pro Rules">
                            <div
                                className='cursor-pointer'
                                onClick={() => onSiteProRules(data)}
                                onContextMenu={(e) => { e.preventDefault(); onSiteProRules(data, 'newTab'); }}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-8 h-8 text-white" fill="currentColor">
                                    <circle cx="12" cy="10" r="1.6" />
                                    <path d="M11 12h2l1.6 8h-5.2L11 12z" />
                                    <path d="M7.8 9.5a5 5 0 0 0 0 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                                    <path d="M5.5 8a8 8 0 0 0 0 9" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                                    <path d="M16.2 9.5a5 5 0 0 1 0 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                                    <path d="M18.5 8a8 8 0 0 1 0 9" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                                    <path d="M20.2 2v4.2M18.2 4.1h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                            </div>
                        </CustomTooltip>
                    )}

                    {/* Cell Pro Rules */}
                    {onCellProRules && (
                        <CustomTooltip text="Click to go Cell Pro Rules">
                            <div
                                className='cursor-pointer'
                                onClick={() => onCellProRules(data)}
                                onContextMenu={(e) => { e.preventDefault(); onCellProRules(data, 'newTab'); }}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="w-8 h-8 text-white">
                                    <path d="M12 6C8.6 6 5.4 7.5 3 9.9L12 19l9-9.1C18.6 7.5 15.4 6 12 6Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                                    <path d="M20.2 2v4.2M18.2 4.1h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                            </div>
                        </CustomTooltip>
                    )}

                    {/* Chart */}
                    {(onChartClick || onChartRightClick) && (
                        <CustomTooltip text="Click to open chart">
                            <div
                                className='cursor-pointer'
                                onClick={() => onChartClick?.(data)}
                                onContextMenu={(e) => { e.preventDefault(); onChartRightClick?.(data); }}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6 text-white">
                                    <path fillRule="evenodd" d="M2.25 13.5a8.25 8.25 0 0 1 8.25-8.25.75.75 0 0 1 .75.75v6.75H18a.75.75 0 0 1 .75.75 8.25 8.25 0 0 1-16.5 0Z" clipRule="evenodd" />
                                    <path fillRule="evenodd" d="M12.75 3a.75.75 0 0 1 .75-.75 8.25 8.25 0 0 1 8.25 8.25.75.75 0 0 1-.75.75h-7.5a.75.75 0 0 1-.75-.75V3Z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </CustomTooltip>
                    )}

                    {/* Close */}
                    <CustomTooltip text="Close">
                        <div className='cursor-pointer' onClick={onClose}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6 text-white">
                                <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-1.72 6.97a.75.75 0 1 0-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 1 0 1.06 1.06L12 13.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L13.06 12l1.72-1.72a.75.75 0 1 0-1.06-1.06L12 10.94l-1.72-1.72Z" clipRule="evenodd" />
                            </svg>
                        </div>
                    </CustomTooltip>

                </div>

                {/* ── Data Table ── */}
                <div className='cursor-move'>
                    <table>
                        <tbody>
                            {Object.entries(data).map((itm) => {
                                const rowKey = itm[0].toLowerCase().replace(/\s/g, '');
                                return (
                                    <tr key={rowKey} className='border-2 border-black'>
                                        <td className='border-2 border-black'>{itm[0]}</td>
                                        <td className='border-2 border-black'>{itm[1]}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

            </div>
        </Dragger>
    );
};

export default CellInfoPopup;