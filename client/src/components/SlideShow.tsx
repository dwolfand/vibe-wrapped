import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import {
  WorkoutStats,
  ClassmateStats,
  LocationStats,
  PeerStats,
} from "../types/stats";
import "./SlideShow.css";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import Confetti from "react-confetti";

ChartJS.register(ArcElement, Tooltip, Legend);

interface SlideShowProps {
  stats: WorkoutStats;
  peerStats?: PeerStats;
  studioId: string;
}

const SlideShow = ({ stats, studioId }: SlideShowProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [dragDirection, setDragDirection] = useState<number>(0);
  const slideRef = useRef<HTMLDivElement>(null);
  const swipeConfidenceThreshold = 50;

  // Track slide view in GA4
  const trackSlideView = useCallback(
    (slideId: string) => {
      window.gtag?.("event", "page_view", {
        page_title: `Vibe Wrapped - ${slideId}`,
        page_path: `/wrapped/${slideId}`,
        client_id: stats.clientId,
        studio_id: studioId,
        unique_id: `${stats.clientId}-${studioId}`,
      });
    },
    [stats.clientId, studioId]
  );

  const paginate = (direction: number) => {
    setCurrentSlide((prev) => {
      const nextSlide = prev + direction;
      if (nextSlide < 0) return slides.length - 1;
      if (nextSlide >= slides.length) return 0;
      return nextSlide;
    });
  };

  // Track slide changes
  useEffect(() => {
    if (slides[currentSlide]) {
      trackSlideView(slides[currentSlide].id);
    }
  }, [currentSlide, trackSlideView]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === "ArrowLeft") {
      paginate(-1);
    } else if (event.key === "ArrowRight") {
      paginate(1);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const handleDragEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    if (info.offset.x < -swipeConfidenceThreshold) {
      paginate(1);
    } else if (info.offset.x > swipeConfidenceThreshold) {
      paginate(-1);
    }
  };

  const handleDrag = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    setDragDirection(info.offset.x > 0 ? -1 : 1);
  };

  const slides = [
    {
      id: "total-classes",
      content: (
        <>
          <h2>Your Year in Review</h2>
          <div className="stat-number">{stats.totalClasses}</div>
          <p>Total classes crushed</p>
        </>
      ),
    },
    {
      id: "member-comparison",
      content: (
        <>
          <h2>How You Stack Up</h2>
          <div className="percentile-grid">
            <div className="percentile-item">
              <div className="percentile-label">Total Classes</div>
              <div className="percentile-value">
                {Math.round(
                  100 - stats.peerComparison.percentiles.totalClasses
                ) <= 1
                  ? "Top 1% 🏆"
                  : `Top ${Math.round(
                      100 - stats.peerComparison.percentiles.totalClasses
                    )}%`}
              </div>
              <div className="percentile-context">Of all members</div>
            </div>
            <div className="percentile-item">
              <div className="percentile-label">Perfect Weeks</div>
              <div className="percentile-value">
                {Math.round(
                  100 - stats.peerComparison.percentiles.perfectWeeks
                ) <= 1
                  ? "Top 1% 🏆"
                  : `Top ${Math.round(
                      100 - stats.peerComparison.percentiles.perfectWeeks
                    )}%`}
              </div>
              <div className="percentile-context">In perfect weeks</div>
            </div>
            <div className="percentile-item">
              <div className="percentile-label">Classes per week</div>
              <div className="percentile-value">
                {Math.round(
                  100 - stats.peerComparison.percentiles.classesPerMonth
                ) <= 1
                  ? "Top 1% 🏆"
                  : `Top ${Math.round(
                      100 - stats.peerComparison.percentiles.classesPerMonth
                    )}%`}
              </div>
              <div className="percentile-context">Of all members</div>
            </div>
          </div>
        </>
      ),
    },
    {
      id: "monthly-progress",
      content: (
        <>
          <h2>Your Year at Vibe Studio</h2>
          <div className="monthly-chart">
            {stats.classesPerMonth.map((month, index) => (
              <div key={month.month} className="month-bar">
                <motion.div
                  className="bar"
                  initial={{ height: 0 }}
                  animate={{ height: `${(month.count / 20) * 100}%` }}
                  transition={{ delay: index * 0.1 }}
                />
                <span className="month-label">{month.month}</span>
                <span className="count-label">{month.count}</span>
              </div>
            ))}
          </div>
        </>
      ),
    },
    {
      id: "class-types",
      content: (
        <>
          <h2>Your Vibe Mix</h2>
          <div className="pie-chart-container">
            <Pie
              data={{
                labels: stats.favoriteClasses.map((c) => c.class_name),
                datasets: [
                  {
                    data: stats.favoriteClasses.map((c) => c.count),
                    backgroundColor: ["#ff00ff", "#00ffff", "#9d00ff"],
                    borderColor: [
                      "rgba(0, 0, 0, 0.2)",
                      "rgba(0, 0, 0, 0.2)",
                      "rgba(0, 0, 0, 0.2)",
                    ],
                    borderWidth: 1,
                  },
                ],
              }}
              options={{
                plugins: {
                  legend: {
                    display: false,
                  },
                  tooltip: {
                    enabled: true,
                    backgroundColor: "rgba(0, 0, 0, 0.8)",
                    titleColor: "#fff",
                    bodyColor: "#fff",
                    padding: 12,
                    displayColors: false,
                    callbacks: {
                      label: function (context) {
                        const value = context.raw as number;
                        const percentage =
                          stats.favoriteClasses[context.dataIndex].percentage;
                        return `${value} classes (${percentage.toFixed(1)}%)`;
                      },
                    },
                  },
                },
                responsive: true,
                maintainAspectRatio: true,
                layout: {
                  padding: {
                    top: 10,
                    bottom: 10,
                  },
                },
              }}
            />
          </div>
          <p className="stat-detail">
            You crushed <br />
            {stats.favoriteClasses.map((classType, index) => (
              <span key={classType.class_name}>
                <span className={`class-type-${index}`}>
                  {classType.count} {classType.class_name}
                </span>
                {index < stats.favoriteClasses.length - 1 ? " " : null}
              </span>
            ))}
            <br />
            classes!
          </p>
        </>
      ),
    },
    {
      id: "time-patterns",
      content: (
        <>
          <h2>Your Studio Schedule</h2>
          <div className="time-patterns">
            <div className="pattern-item">
              <span className="highlight">{stats.favoriteTimeOfDay}</span>
              <p>Favorite time</p>
            </div>
            <div className="pattern-item">
              <span className="highlight">{stats.mostFrequentDay}</span>
              <p>Most frequent day</p>
            </div>
            <div className="pattern-item">
              <span className="highlight">
                {stats.peerComparison.averageClassesPerMonth}
              </span>
              <p>Avg classes per week</p>
            </div>
          </div>
        </>
      ),
    },
    {
      id: "streak",
      content: (
        <>
          <h2>Weeks you Vibe'd</h2>
          <div className="stat-number">{stats.perfectMadWeeks}</div>
          <p>Weeks with 2+ classes</p>
        </>
      ),
    },
    {
      id: "favorite-coach",
      content: (
        <>
          <h2>Your Favorite Instructor</h2>
          <div className="stat-text">{stats.topCoach}</div>
          <p>Thanks for the motivation!</p>
        </>
      ),
    },
    {
      id: "workout-buddies",
      content: (
        <>
          <h2>Your Workout Buddies</h2>
          <div className="workout-buddies">
            {stats.peerComparison.topClassmates.map(
              (buddy: ClassmateStats, index: number) => (
                <div key={index} className="buddy-item">
                  <div className="buddy-name">{`${
                    buddy.firstName
                  } ${buddy.lastName.slice(0, 1)}.`}</div>
                  <div className="shared-classes">{buddy.sharedClasses}</div>
                  <p>Classes together</p>
                </div>
              )
            )}
          </div>
        </>
      ),
    },
    {
      id: "booking-habits",
      content: (
        <>
          <h2>Booking Habits</h2>
          <div className="booking-stats">
            <div className="booking-item">
              <span className="stat-circle">{stats.totalNoShows}</span>
              <p>No Shows</p>
            </div>
            <div className="booking-item">
              <span className="stat-circle">{stats.totalCancellations}</span>
              <p>Cancellations</p>
            </div>
          </div>
        </>
      ),
    },
    {
      id: "final-slide",
      content: (
        <>
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              overflow: "hidden",
              pointerEvents: "none",
            }}
          >
            <Confetti
              width={600}
              height={600}
              recycle={false}
              numberOfPieces={250}
            />
          </div>
          <h2>Ready to Crush 2025?</h2>
          <div className="share-section">
            <p className="share-text">Share your vibes on Instagram!</p>
            <p className="tag-text">
              Tag us{" "}
              <a
                href="https://www.instagram.com/thevibestudio_lynchburg"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "inherit", textDecoration: "none" }}
              >
                @thevibestudio_lynchburg
              </a>
            </p>
            <div className="motivation-text">
              Let's see how you'll stack up next year! 💃
            </div>
          </div>
        </>
      ),
    },
  ];

  return (
    <div className="slideshow">
      <div className="slide-header">
        <img src="/logo.jpg" alt="Logo" className="logo" />
        <h1 className="year-title">{stats.firstName}'s 2024 Year in Review</h1>
      </div>
      <motion.div
        className="slide-container"
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        onClick={() => paginate(1)}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            ref={slideRef}
            className="slide"
            initial={{ opacity: 0, x: 50 * dragDirection }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 * dragDirection }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
            whileTap={{ cursor: "grabbing" }}
          >
            {slides[currentSlide].content}
          </motion.div>
        </AnimatePresence>
      </motion.div>

      <motion.div
        className="progress-dots"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        {slides.map((_, index) => (
          <motion.div
            key={index}
            className={`dot ${index === currentSlide ? "active" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              setCurrentSlide(index);
            }}
            whileHover={{ scale: 1.5 }}
            whileTap={{ scale: 0.9 }}
            animate={
              index === currentSlide
                ? {
                    scale: [1, 1.2, 1],
                    transition: {
                      duration: 0.5,
                      ease: "easeInOut",
                    },
                  }
                : {}
            }
          />
        ))}
      </motion.div>
    </div>
  );
};

export default SlideShow;
