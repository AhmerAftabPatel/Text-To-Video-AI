import React from 'react'
import { AbsoluteFill, Audio, Img, Sequence, Video, interpolate, useCurrentFrame, useVideoConfig } from 'remotion'

function RemotionVideo({script, imageList, audioFileUrl, captions, videoClips, setDurationInFrame}) {
  const {fps} = useVideoConfig();
  const frame = useCurrentFrame();

  const getDurationFrame = () => {
    // Ensure we have captions and get the last caption's end time
    const lastCaption = captions?.[captions.length - 1];
    if (!lastCaption) return 100; // Default duration if no captions
    const captionsDuration = (lastCaption.end / 1000) * fps;
    setDurationInFrame(captionsDuration);
    return captionsDuration;
  };

  const getCurrentCaptions = () => {
    if (!captions?.length) return '';
    const currentTime = (frame / fps) * 1000; // Convert current frame to milliseconds
    const currentCaption = captions.find((word) => 
      currentTime >= word.start && currentTime <= word.end
    );
    return currentCaption ? currentCaption.text : '';
  };

  // Calculate scene timing based on captions
  const getSceneTiming = () => {
    if (!captions || captions.length === 0 || !script?.length) return [];
    
    const totalDuration = getDurationFrame();
    const sceneDuration = totalDuration / script.length;
    
    return script.map((_, index) => ({
      startFrame: Math.round(index * sceneDuration),
      durationInFrames: Math.round(sceneDuration)
    }));
  };

  const sceneTimings = getSceneTiming();

  const handleVideoError = (error) => {
    console.error("Video playback error:", error);
  };

  return script && (
    <AbsoluteFill className='bg-black'>
      {script.map((item, index) => {
        const timing = sceneTimings[index];
        if (!timing) return null;

        const hasVideo = videoClips?.[index]?.url;
        const scale = interpolate(
          frame,
          [
            timing.startFrame,
            timing.startFrame + timing.durationInFrames/2,
            timing.startFrame + timing.durationInFrames
          ],
          index % 2 === 0 ? [1, 1.5, 1] : [1.5, 1, 1.5],
          {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp'
          }
        );

        return (
          <Sequence 
            key={index} 
            from={timing.startFrame} 
            durationInFrames={timing.durationInFrames}
          >
            <AbsoluteFill style={{
              justifyContent: 'center',
              alignItems: 'center',
              overflow: 'hidden'
            }}>
              {hasVideo ? (
                <Video
                  src={videoClips[index].url}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                  onError={handleVideoError}
                />
              ) : (
                <Img
                  src={imageList[index]}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transform: `scale(${scale})`
                  }}
                />
              )}
            </AbsoluteFill>
          </Sequence>
        );
      })}
      
      {/* Caption overlay */}
      <AbsoluteFill 
        style={{
          background: 'linear-gradient(transparent, rgba(0, 0, 0, 0.8))',
          position: 'absolute',
          top: 'auto',
          bottom: 0,
          height: '30%',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          padding: '20px',
          zIndex: 1000
        }}
      >
        <h2 
          className='text-2xl sm:text-3xl text-white text-center font-bold'
          style={{
            textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
            maxWidth: '90%',
            margin: '0 auto',
            lineHeight: '1.4',
            letterSpacing: '0.5px',
            marginBottom: '20px'
          }}
        >
          {getCurrentCaptions()}
        </h2>
      </AbsoluteFill>

      {/* Audio track */}
      {audioFileUrl && <Audio src={audioFileUrl} />}
    </AbsoluteFill>
  );
}

export default RemotionVideo;