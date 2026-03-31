/**
 * @vitest-environment jsdom
 */
import { render, screen, fireEvent, act } from '@testing-library/react';

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import VideoPlayer from '../VideoPlayer';

// Mock Lucide-react icons
vi.mock('lucide-react', () => ({
  Play: () => <div data-testid="play-icon" />,
  Pause: () => <div data-testid="pause-icon" />,
  Volume2: () => <div data-testid="volume2-icon" />,
  VolumeX: () => <div data-testid="volumex-icon" />,
  Maximize2: () => <div data-testid="maximize-icon" />,
  RotateCcw: () => <div data-testid="rotateccw-icon" />,
  RotateCw: () => <div data-testid="rotatecw-icon" />,
  Film: () => <div data-testid="film-icon" />
}));

describe('VideoPlayer Auto-Hide Controls', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('controls should stay visible when paused', () => {
    render(<VideoPlayer src="test.mp4" />);
    // When initially rendered (paused), controls should be visible
    const controlsContainer = screen.getByTestId('play-icon').closest('div.px-4.pb-4.pt-6');
    expect(controlsContainer.className).toContain('opacity-100');
    
    // Fast forward 6 seconds, should still be visible because it is paused
    act(() => {
      vi.advanceTimersByTime(6000);
    });
    expect(controlsContainer.className).toContain('opacity-100');
  });

  it('controls should hide after 5 seconds of playing with no mouse movement', () => {
    const { container } = render(<VideoPlayer src="test.mp4" />);
    const video = container.querySelector('video');
    
    // Simulate playing the video
    act(() => {
      // Mock play to resolve immediately
      video.play = vi.fn().mockResolvedValue(true);
      fireEvent.playing(video);
    });

    const controlsContainer = screen.getAllByTestId('pause-icon')[0].closest('div.px-4.pb-4.pt-6');
    
    // Initially when playing starts, controls should be visible
    expect(controlsContainer.className).toContain('opacity-100');

    // Fast forward 5.1 seconds
    act(() => {
      vi.advanceTimersByTime(5100);
    });

    // Controls should now be hidden
    expect(controlsContainer.className).toContain('opacity-0');
  });

  it('mouse movement should show controls and reset hide timer', () => {
    const { container } = render(<VideoPlayer src="test.mp4" />);
    const video = container.querySelector('video');
    const mainContainer = container.firstChild;
    
    // Start playing
    act(() => {
      video.play = vi.fn().mockResolvedValue(true);
      fireEvent.playing(video);
    });

    const controlsContainer = screen.getAllByTestId('pause-icon')[0].closest('div.px-4.pb-4.pt-6');
    
    // Fast forward 3 seconds (controls still visible, about to hide at 5s)
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    
    // Simulate mouse movement
    act(() => {
      fireEvent.mouseMove(mainContainer);
    });
    
    // Fast forward 3 more seconds (total 6s since play, 3s since move)
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    
    // Controls should STILL be visible because mouse movement reset the 5s timer
    expect(controlsContainer.className).toContain('opacity-100');
    
    // Fast forward 3 more seconds (total 6s since move)
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    
    // Now it should be hidden
    expect(controlsContainer.className).toContain('opacity-0');
  });
});
