import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { NoteInfo } from '../types';

interface TunerMeterProps {
  noteInfo: NoteInfo | null;
  isActive: boolean;
}

const TunerMeter: React.FC<TunerMeterProps> = ({ noteInfo, isActive }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  // Dimensions
  const width = 300;
  const height = 180; // Semi-circle height
  const radius = 140;
  const needleLength = 120;

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous render

    const g = svg.append("g")
      .attr("transform", `translate(${width / 2}, ${height - 20})`);

    // 1. Draw the Gauge Arc (Background)
    const arc = d3.arc()
      .innerRadius(radius - 10)
      .outerRadius(radius)
      .startAngle(-Math.PI / 2)
      .endAngle(Math.PI / 2);

    // Gradient definitions
    const defs = svg.append("defs");
    const linearGradient = defs.append("linearGradient")
      .attr("id", "gauge-gradient");
    
    linearGradient.append("stop").attr("offset", "0%").attr("stop-color", "#f43f5e"); // Rose (Flat)
    linearGradient.append("stop").attr("offset", "45%").attr("stop-color", "#fbbf24"); // Amber (Close)
    linearGradient.append("stop").attr("offset", "50%").attr("stop-color", "#10b981"); // Emerald (In Tune)
    linearGradient.append("stop").attr("offset", "55%").attr("stop-color", "#fbbf24"); // Amber (Close)
    linearGradient.append("stop").attr("offset", "100%").attr("stop-color", "#f43f5e"); // Rose (Sharp)

    g.append("path")
      // @ts-ignore
      .attr("d", arc)
      .style("fill", "url(#gauge-gradient)");

    // 2. Draw Ticks
    const scale = d3.scaleLinear()
      .domain([-50, 50])
      .range([-90, 90]);

    const ticks = [-50, -25, 0, 25, 50];
    
    g.selectAll(".tick")
      .data(ticks)
      .enter()
      .append("line")
      .attr("class", "tick")
      .attr("x1", d => (radius - 15) * Math.cos((scale(d) - 90) * Math.PI / 180))
      .attr("y1", d => (radius - 15) * Math.sin((scale(d) - 90) * Math.PI / 180))
      .attr("x2", d => (radius + 5) * Math.cos((scale(d) - 90) * Math.PI / 180))
      .attr("y2", d => (radius + 5) * Math.sin((scale(d) - 90) * Math.PI / 180))
      .style("stroke", d => d === 0 ? "#10b981" : "#4b5563")
      .style("stroke-width", d => d === 0 ? 3 : 1);

    // 3. Draw Needle Group
    const needleGroup = g.append("g").attr("class", "needle-group");

    needleGroup.append("circle")
      .attr("r", 8)
      .style("fill", "#e5e7eb");

    needleGroup.append("line")
      .attr("x1", 0)
      .attr("y1", 0)
      .attr("x2", 0)
      .attr("y2", -needleLength)
      .style("stroke", "#e5e7eb")
      .style("stroke-width", 3)
      .style("stroke-linecap", "round");

    // Initial Position
    needleGroup.attr("transform", `rotate(-90)`);

  }, []);

  // Animate Needle on Update
  useEffect(() => {
    if (!svgRef.current) return;
    
    const cents = noteInfo ? noteInfo.deviation : -90; // Park needle left if no note
    // Clamp cents to -50 to +50 for visual range, map to angles
    const clampedCents = Math.max(-50, Math.min(50, isActive ? cents : -90));
    
    const targetAngle = isActive 
      ? (clampedCents / 50) * 90 // Map -50..50 to -90..90 deg
      : -90;

    const svg = d3.select(svgRef.current);
    svg.select(".needle-group")
      .transition()
      .duration(200)
      .ease(d3.easeCubicOut)
      .attr("transform", `rotate(${targetAngle})`);

  }, [noteInfo, isActive]);

  // Determine Status Color for Text
  const getStatusColor = () => {
    if (!isActive || !noteInfo) return "text-gray-500";
    const absDev = Math.abs(noteInfo.deviation);
    if (absDev < 5) return "text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.5)]"; // Perfect
    if (absDev < 15) return "text-amber-400"; // Close
    return "text-rose-400"; // Off
  };

  return (
    <div className="flex flex-col items-center justify-center mt-8">
      <svg ref={svgRef} width={300} height={180} className="overflow-visible" />
      
      <div className="flex flex-col items-center -mt-8 z-10">
        {isActive && noteInfo ? (
          <>
            <div className={`text-6xl font-black ${getStatusColor()} transition-colors duration-200`}>
              {noteInfo.name}
              <span className="text-2xl font-medium text-gray-500 ml-1">{noteInfo.octave}</span>
            </div>
            <div className="h-6 mt-2">
               {Math.abs(noteInfo.deviation) < 5 ? (
                 <span className="text-emerald-400 font-bold tracking-widest uppercase text-sm">Perfect</span>
               ) : (
                 <span className="text-gray-400 text-sm font-mono">
                    {noteInfo.deviation > 0 ? `+${noteInfo.deviation}` : noteInfo.deviation} cents
                 </span>
               )}
            </div>
          </>
        ) : (
          <div className="text-4xl font-bold text-gray-700 opacity-50">--</div>
        )}
      </div>
    </div>
  );
};

export default TunerMeter;
