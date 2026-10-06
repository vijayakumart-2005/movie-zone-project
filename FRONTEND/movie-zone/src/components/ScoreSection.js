import React from "react";
import ScoreGauge from "./ScoreGauge";

// Two score gauges: the TMDB audience rating (0-10) and the share of
// reviews the sentiment model classified as GOOD (0-100%).
function ScoreSection({ rating, voteCount, reviews, sentimentLoading }) {
  const hasRating = voteCount > 0 && rating > 0;

  let sentimentScore = null;
  let sentimentNote = sentimentLoading ? "Analyzing reviews..." : "No reviews found";
  if (reviews && reviews.length > 0) {
    const good = reviews.filter((r) => r.sentiment === "GOOD").length;
    sentimentScore = (good / reviews.length) * 100;
    sentimentNote = `${good} of ${reviews.length} reviews are positive`;
  }

  return (
    <>
      <center>
        <h1 className="title">Movie Score</h1>
      </center>
      <div className="score_section">
        <ScoreGauge
          title="Audience Rating"
          value={hasRating ? rating : null}
          min={0}
          max={10}
          decimals={1}
          subtitle={hasRating ? `Based on ${voteCount} votes` : "Not rated yet"}
        />
        <ScoreGauge
          title="Review Sentiment"
          value={sentimentScore}
          min={0}
          max={100}
          decimals={0}
          unit="%"
          subtitle={sentimentNote}
          emptyText={sentimentLoading ? "..." : "N/A"}
        />
      </div>
    </>
  );
}

export default ScoreSection;
