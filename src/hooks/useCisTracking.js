import { useState, useEffect, useRef } from "react";
import { cisApi } from "../services/cisApi";

export const useCisTracking = (
  contentId,
  contentType,
  contentLocation = "portal"
) => {
  const [isVisible, setIsVisible] = useState(false);
  const [dwellTime, setDwellTime] = useState(0);
  const startTimeRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          startTimeRef.current = Date.now();

          // Record view interaction
          cisApi.recordInteraction({
            content_id: contentId,
            content_type: contentType,
            interaction_type: "views",
            content_location: contentLocation,
          });
        } else {
          setIsVisible(false);
          if (startTimeRef.current) {
            const totalDwellTime = Date.now() - startTimeRef.current;
            setDwellTime(totalDwellTime);

            // Record dwell time when content becomes invisible
            cisApi.recordInteraction({
              content_id: contentId,
              content_type: contentType,
              interaction_type: "views",
              content_location: contentLocation,
              dwell_time_ms: totalDwellTime,
            });
          }
        }
      },
      { threshold: 0.5 }
    );

    const element = document.getElementById(contentId);
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, [contentId, contentType, contentLocation]);

  const recordInteraction = async (interactionType, extraData = {}) => {
    try {
      await cisApi.recordInteraction({
        content_id: contentId,
        content_type: contentType,
        interaction_type: interactionType,
        content_location: contentLocation,
        dwell_time_ms: dwellTime,
        extra_data: extraData,
      });
    } catch (error) {
      console.error("Failed to record interaction:", error);
    }
  };

  return { isVisible, dwellTime, recordInteraction };
};
