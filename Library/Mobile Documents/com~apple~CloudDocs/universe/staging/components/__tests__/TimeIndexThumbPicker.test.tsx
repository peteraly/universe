#Context: TimeIndexThumbPicker Test Skeleton
// Test suite for TimeIndexThumbPicker component
// Part of V12.0 L1 Event Curation Hub implementation

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { TimeIndexThumbPicker } from '../TimeIndexThumbPicker';

describe('TimeIndexThumbPicker', () => {
  // TODO: Implement basic rendering tests
  it('renders without crashing', () => {
    // TODO: Test basic component rendering
    render(<TimeIndexThumbPicker />);
    expect(screen.getByRole('slider')).toBeInTheDocument();
  });

  // TODO: Implement props testing
  it('accepts and displays initial value', () => {
    // TODO: Test value prop
    const testValue = '14:30';
    render(<TimeIndexThumbPicker value={testValue} />);
    expect(screen.getByText(testValue)).toBeInTheDocument();
  });

  // TODO: Implement change handler testing
  it('calls onChange when value changes', () => {
    // TODO: Test onChange callback
    const mockOnChange = jest.fn();
    render(<TimeIndexThumbPicker onChange={mockOnChange} />);
    // TODO: Simulate value change
    expect(mockOnChange).toHaveBeenCalled();
  });

  // TODO: Implement drag interaction testing
  it('handles mouse drag interactions', () => {
    // TODO: Test mouse drag functionality
    render(<TimeIndexThumbPicker />);
    const thumb = screen.getByRole('slider');
    
    // TODO: Simulate mouse down, move, up
    fireEvent.mouseDown(thumb);
    fireEvent.mouseMove(thumb);
    fireEvent.mouseUp(thumb);
  });

  // TODO: Implement touch interaction testing
  it('handles touch drag interactions', () => {
    // TODO: Test touch drag functionality
    render(<TimeIndexThumbPicker />);
    const thumb = screen.getByRole('slider');
    
    // TODO: Simulate touch start, move, end
    fireEvent.touchStart(thumb);
    fireEvent.touchMove(thumb);
    fireEvent.touchEnd(thumb);
  });

  // TODO: Implement keyboard navigation testing
  it('handles keyboard navigation', () => {
    // TODO: Test keyboard interactions
    render(<TimeIndexThumbPicker />);
    const thumb = screen.getByRole('slider');
    
    // TODO: Test arrow keys, home, end
    fireEvent.keyDown(thumb, { key: 'ArrowRight' });
    fireEvent.keyDown(thumb, { key: 'ArrowLeft' });
    fireEvent.keyDown(thumb, { key: 'Home' });
    fireEvent.keyDown(thumb, { key: 'End' });
  });

  // TODO: Implement accessibility testing
  it('has proper accessibility attributes', () => {
    // TODO: Test ARIA attributes
    render(<TimeIndexThumbPicker />);
    const thumb = screen.getByRole('slider');
    
    expect(thumb).toHaveAttribute('aria-label', 'Time picker');
    expect(thumb).toHaveAttribute('aria-valuenow');
    expect(thumb).toHaveAttribute('aria-valuemin');
    expect(thumb).toHaveAttribute('aria-valuemax');
  });

  // TODO: Implement disabled state testing
  it('handles disabled state correctly', () => {
    // TODO: Test disabled prop
    render(<TimeIndexThumbPicker disabled={true} />);
    const thumb = screen.getByRole('slider');
    
    expect(thumb).toHaveAttribute('tabIndex', '-1');
  });

  // TODO: Implement min/max constraints testing
  it('respects min and max time constraints', () => {
    // TODO: Test minTime and maxTime props
    const minTime = '09:00';
    const maxTime = '17:00';
    render(
      <TimeIndexThumbPicker 
        minTime={minTime} 
        maxTime={maxTime} 
      />
    );
    
    const thumb = screen.getByRole('slider');
    expect(thumb).toHaveAttribute('aria-valuemin', minTime);
    expect(thumb).toHaveAttribute('aria-valuemax', maxTime);
  });

  // TODO: Implement step increment testing
  it('respects step increment', () => {
    // TODO: Test step prop
    const step = 30;
    render(<TimeIndexThumbPicker step={step} />);
    
    // TODO: Test that value changes respect step increment
  });

  // TODO: Implement edge case testing
  it('handles edge cases gracefully', () => {
    // TODO: Test midnight rollover, invalid times, etc.
    render(<TimeIndexThumbPicker />);
    
    // TODO: Test edge cases
  });

  // TODO: Implement performance testing
  it('performs well with frequent updates', () => {
    // TODO: Test performance with rapid value changes
    render(<TimeIndexThumbPicker />);
    
    // TODO: Simulate rapid drag operations
  });
});

// ============================================================================
// TIME HELPER FUNCTIONS TESTS
// ============================================================================

import { 
  toDisplayLabel, 
  toFullLabel, 
  normalizeValue, 
  toOutputString, 
  snapMinute 
} from '../../lib/time/format';

describe('Time Helper Functions', () => {
  describe('toDisplayLabel', () => {
    it('formats 24h hour correctly', () => {
      expect(toDisplayLabel(9, '24h')).toBe('09');
      expect(toDisplayLabel(9, '24h', true)).toBe('9');
      expect(toDisplayLabel(15, '24h')).toBe('15');
    });

    it('formats 12h hour correctly', () => {
      expect(toDisplayLabel(9, '12h')).toBe('09');
      expect(toDisplayLabel(9, '12h', true)).toBe('9');
      expect(toDisplayLabel(15, '12h')).toBe('03');
      expect(toDisplayLabel(0, '12h')).toBe('12');
    });
  });

  describe('toFullLabel', () => {
    it('formats 24h time correctly', () => {
      expect(toFullLabel(9, 30, '24h')).toBe('09:30');
      expect(toFullLabel(15, 45, '24h')).toBe('15:45');
    });

    it('formats 12h time correctly', () => {
      expect(toFullLabel(9, 30, '12h')).toBe('09:30 AM');
      expect(toFullLabel(15, 45, '12h')).toBe('03:45 PM');
      expect(toFullLabel(0, 0, '12h')).toBe('12:00 AM');
    });
  });

  describe('normalizeValue', () => {
    it('normalizes string time correctly', () => {
      expect(normalizeValue('09:30')).toEqual({ hour: 9, minute: 30 });
      expect(normalizeValue('15:45')).toEqual({ hour: 15, minute: 45 });
    });

    it('normalizes minute number correctly', () => {
      expect(normalizeValue(570)).toEqual({ hour: 9, minute: 30 }); // 9:30
      expect(normalizeValue(945)).toEqual({ hour: 15, minute: 45 }); // 15:45
    });
  });

  describe('toOutputString', () => {
    it('formats time with local preference', () => {
      const result = toOutputString(9, 30, true);
      expect(result).toMatch(/^\d{2}:\d{2}$/);
    });

    it('formats time without local preference', () => {
      expect(toOutputString(9, 30, false)).toBe('09:30');
      expect(toOutputString(15, 45, false)).toBe('15:45');
    });
  });

  describe('snapMinute', () => {
    it('snaps to 15-minute granularity', () => {
      expect(snapMinute(7, 15)).toBe(0);
      expect(snapMinute(8, 15)).toBe(15);
      expect(snapMinute(22, 15)).toBe(15);
      expect(snapMinute(23, 15)).toBe(30);
    });

    it('snaps to 30-minute granularity', () => {
      expect(snapMinute(14, 30)).toBe(0);
      expect(snapMinute(16, 30)).toBe(30);
      expect(snapMinute(44, 30)).toBe(30);
      expect(snapMinute(46, 30)).toBe(60);
    });

    it('handles edge cases', () => {
      expect(snapMinute(0, 15)).toBe(0);
      expect(snapMinute(59, 15)).toBe(60);
      expect(snapMinute(-5, 15)).toBe(0);
      expect(snapMinute(70, 15)).toBe(60);
    });
  });

  // ============================================================================
  // MINUTE SNAPPING + MINUTE WHEEL TESTS
  // ============================================================================

  describe('Minute Snapping + Minute Wheel', () => {
    let mockOnChange: jest.Mock;

    beforeEach(() => {
      mockOnChange = jest.fn();
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('opens minute sheet on long press (600ms)', async () => {
      render(<TimeIndexThumbPicker onChange={mockOnChange} />);
      const rail = screen.getByRole('slider');
      
      // Start long press
      fireEvent.mouseDown(rail);
      
      // Wait for long press to trigger
      await waitFor(() => {
        expect(screen.getByText('Select Minutes')).toBeInTheDocument();
      }, { timeout: 700 });
    });

    it('cancels long press on drag movement', async () => {
      render(<TimeIndexThumbPicker onChange={mockOnChange} />);
      const rail = screen.getByRole('slider');
      
      // Start long press
      fireEvent.mouseDown(rail);
      
      // Move before 600ms (should cancel long press)
      fireEvent.mouseMove(rail);
      
      // Wait to ensure sheet doesn't open
      await new Promise(resolve => setTimeout(resolve, 700));
      expect(screen.queryByText('Select Minutes')).not.toBeInTheDocument();
    });

    it('selects minute from sheet and fires onChange', async () => {
      render(<TimeIndexThumbPicker onChange={mockOnChange} />);
      const rail = screen.getByRole('slider');
      
      // Trigger long press to open sheet
      fireEvent.mouseDown(rail);
      await waitFor(() => {
        expect(screen.getByText('Select Minutes')).toBeInTheDocument();
      }, { timeout: 700 });
      
      // Click on 15 minute option
      const minuteButton = screen.getByText('15');
      fireEvent.click(minuteButton);
      
      // Verify onChange was called
      expect(mockOnChange).toHaveBeenCalled();
    });

    it('closes minute sheet when backdrop is clicked', async () => {
      render(<TimeIndexThumbPicker onChange={mockOnChange} />);
      const rail = screen.getByRole('slider');
      
      // Trigger long press to open sheet
      fireEvent.mouseDown(rail);
      await waitFor(() => {
        expect(screen.getByText('Select Minutes')).toBeInTheDocument();
      }, { timeout: 700 });
      
      // Click backdrop to close
      const backdrop = screen.getByRole('button', { hidden: true });
      fireEvent.click(backdrop);
      
      // Verify sheet is closed
      expect(screen.queryByText('Select Minutes')).not.toBeInTheDocument();
    });

    it('snaps to nearest granularity on pointerup', () => {
      render(<TimeIndexThumbPicker onChange={mockOnChange} granularityMinutes={15} />);
      const rail = screen.getByRole('slider');
      
      // Start drag
      fireEvent.mouseDown(rail);
      fireEvent.mouseMove(rail);
      
      // End drag (should snap)
      fireEvent.mouseUp(rail);
      
      // Verify onChange was called with snapped time
      expect(mockOnChange).toHaveBeenCalled();
    });

    it('handles custom minute input', async () => {
      render(<TimeIndexThumbPicker onChange={mockOnChange} />);
      const rail = screen.getByRole('slider');
      
      // Trigger long press to open sheet
      fireEvent.mouseDown(rail);
      await waitFor(() => {
        expect(screen.getByText('Select Minutes')).toBeInTheDocument();
      }, { timeout: 700 });
      
      // Find custom input
      const customInput = screen.getByDisplayValue('0');
      fireEvent.change(customInput, { target: { value: '23' } });
      
      // Click set button
      const setButton = screen.getByText('Set');
      fireEvent.click(setButton);
      
      // Verify onChange was called
      expect(mockOnChange).toHaveBeenCalled();
    });

    it('ensures 56px touch targets for minute options', async () => {
      render(<TimeIndexThumbPicker onChange={mockOnChange} />);
      const rail = screen.getByRole('slider');
      
      // Trigger long press to open sheet
      fireEvent.mouseDown(rail);
      await waitFor(() => {
        expect(screen.getByText('Select Minutes')).toBeInTheDocument();
      }, { timeout: 700 });
      
      // Check that minute buttons have proper height
      const minuteButtons = screen.getAllByRole('button');
      minuteButtons.forEach(button => {
        const style = window.getComputedStyle(button);
        expect(parseInt(style.minHeight)).toBeGreaterThanOrEqual(56);
      });
    });
  });

  // ============================================================================
  // ACCESSIBILITY TESTS
  // ============================================================================

  describe('Accessibility', () => {
    let mockOnChange: jest.Mock;

    beforeEach(() => {
      mockOnChange = jest.fn();
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('has proper ARIA roles and attributes', () => {
      render(<TimeIndexThumbPicker onChange={mockOnChange} />);
      
      // Main component should have application role
      const picker = screen.getByRole('application');
      expect(picker).toHaveAttribute('aria-label', 'Time picker with coarse and fine hour selection');
      expect(picker).toHaveAttribute('aria-describedby', 'time-picker-instructions');
      
      // Rail should have navigation role
      const rail = screen.getByRole('navigation');
      expect(rail).toHaveAttribute('aria-label', 'Time period selection');
      
      // Cells should have listbox role
      const listbox = screen.getByRole('listbox');
      expect(listbox).toHaveAttribute('aria-label', 'Time period options');
      
      // Options should have proper attributes
      const options = screen.getAllByRole('option');
      expect(options).toHaveLength(4); // M, A, E, N
      
      options.forEach((option, index) => {
        expect(option).toHaveAttribute('aria-selected');
        expect(option).toHaveAttribute('aria-label');
      });
    });

    it('supports keyboard navigation with arrow keys', () => {
      render(<TimeIndexThumbPicker onChange={mockOnChange} />);
      const picker = screen.getByRole('application');
      
      // Test arrow up
      fireEvent.keyDown(picker, { key: 'ArrowUp' });
      expect(mockOnChange).toHaveBeenCalled();
      
      // Test arrow down
      fireEvent.keyDown(picker, { key: 'ArrowDown' });
      expect(mockOnChange).toHaveBeenCalled();
      
      // Test arrow left
      fireEvent.keyDown(picker, { key: 'ArrowLeft' });
      expect(mockOnChange).toHaveBeenCalled();
      
      // Test arrow right
      fireEvent.keyDown(picker, { key: 'ArrowRight' });
      expect(mockOnChange).toHaveBeenCalled();
    });

    it('supports Page Up/Down navigation', () => {
      render(<TimeIndexThumbPicker onChange={mockOnChange} />);
      const picker = screen.getByRole('application');
      
      // Test Page Up
      fireEvent.keyDown(picker, { key: 'PageUp' });
      expect(mockOnChange).toHaveBeenCalled();
      
      // Test Page Down
      fireEvent.keyDown(picker, { key: 'PageDown' });
      expect(mockOnChange).toHaveBeenCalled();
    });

    it('supports Home/End navigation', () => {
      render(<TimeIndexThumbPicker onChange={mockOnChange} />);
      const picker = screen.getByRole('application');
      
      // Test Home
      fireEvent.keyDown(picker, { key: 'Home' });
      expect(mockOnChange).toHaveBeenCalled();
      
      // Test End
      fireEvent.keyDown(picker, { key: 'End' });
      expect(mockOnChange).toHaveBeenCalled();
    });

    it('supports Enter and Space for confirmation', () => {
      render(<TimeIndexThumbPicker onChange={mockOnChange} />);
      const picker = screen.getByRole('application');
      
      // Test Enter
      fireEvent.keyDown(picker, { key: 'Enter' });
      expect(mockOnChange).toHaveBeenCalled();
      
      // Test Space
      fireEvent.keyDown(picker, { key: ' ' });
      expect(mockOnChange).toHaveBeenCalled();
    });

    it('supports Escape to cancel', () => {
      render(<TimeIndexThumbPicker onChange={mockOnChange} />);
      const picker = screen.getByRole('application');
      
      // Test Escape
      fireEvent.keyDown(picker, { key: 'Escape' });
      // Should not call onChange
      expect(mockOnChange).not.toHaveBeenCalled();
    });

    it('has screen reader instructions', () => {
      render(<TimeIndexThumbPicker onChange={mockOnChange} />);
      
      const instructions = screen.getByText(/Use arrow keys to navigate/);
      expect(instructions).toBeInTheDocument();
      expect(instructions).toHaveClass('sr-only');
    });

    it('announces time changes to screen readers', () => {
      render(<TimeIndexThumbPicker onChange={mockOnChange} />);
      const picker = screen.getByRole('application');
      
      // Trigger a time change
      fireEvent.keyDown(picker, { key: 'ArrowUp' });
      
      // Should have live region for announcements
      const liveRegion = screen.getByRole('status');
      expect(liveRegion).toHaveAttribute('aria-live', 'polite');
    });

    it('has proper focus management', () => {
      render(<TimeIndexThumbPicker onChange={mockOnChange} />);
      const picker = screen.getByRole('application');
      
      // Should be focusable
      expect(picker).toHaveAttribute('tabIndex', '0');
      
      // Test focus
      picker.focus();
      expect(document.activeElement).toBe(picker);
    });

    it('respects disabled state for accessibility', () => {
      render(<TimeIndexThumbPicker onChange={mockOnChange} disabled={true} />);
      const picker = screen.getByRole('application');
      
      // Should not be focusable when disabled
      expect(picker).toHaveAttribute('tabIndex', '-1');
      
      // Should not respond to keyboard events
      fireEvent.keyDown(picker, { key: 'ArrowUp' });
      expect(mockOnChange).not.toHaveBeenCalled();
    });

    it('has proper color contrast for WCAG AA compliance', () => {
      render(<TimeIndexThumbPicker onChange={mockOnChange} />);
      
      // Test that active elements have sufficient contrast
      const activeCell = screen.getByRole('option', { selected: true });
      expect(activeCell).toHaveClass('time-index-cell-active');
      
      // Test that inactive elements are still visible
      const inactiveCells = screen.getAllByRole('option', { selected: false });
      inactiveCells.forEach(cell => {
        expect(cell).toHaveClass('time-index-cell-inactive');
      });
    });
  });

  // ============================================================================
  // INTERACTION TESTS
  // ============================================================================

  describe('Interaction Tests', () => {
    let mockOnChange: jest.Mock;
    let user: ReturnType<typeof userEvent.setup>;

    beforeEach(() => {
      mockOnChange = jest.fn();
      user = userEvent.setup();
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
      jest.clearAllMocks();
    });

    it('tap "A" → afternoon jump', async () => {
      render(<TimeIndexThumbPicker onChange={mockOnChange} />);
      
      // Find the "A" (Afternoon) option
      const afternoonOption = screen.getByRole('option', { name: /Afternoon \(A\)/i });
      
      // Click on the afternoon option
      await user.click(afternoonOption);
      
      // Should call onChange with an afternoon time
      expect(mockOnChange).toHaveBeenCalled();
      const callArgs = mockOnChange.mock.calls[0][0];
      expect(callArgs).toMatch(/1[2-7]:\d{2}/); // Afternoon hours (12-17)
    });

    it('drag selects hour and snaps to minute granularity', async () => {
      render(<TimeIndexThumbPicker onChange={mockOnChange} granularityMinutes={15} />);
      
      const picker = screen.getByRole('application');
      const rail = screen.getByRole('navigation');
      
      // Start drag
      await user.pointer([
        { keys: '[MouseLeft>]', target: rail },
        { coords: { x: 100, y: 200 } },
        { keys: '[/MouseLeft]' }
      ]);
      
      // Should call onChange with snapped time
      expect(mockOnChange).toHaveBeenCalled();
      const callArgs = mockOnChange.mock.calls[0][0];
      const [, minute] = callArgs.split(':');
      const minuteValue = parseInt(minute);
      
      // Should snap to 15-minute granularity
      expect(minuteValue % 15).toBe(0);
    });

    it('long-press opens minute wheel and selection updates', async () => {
      render(<TimeIndexThumbPicker onChange={mockOnChange} />);
      
      const rail = screen.getByRole('navigation');
      
      // Long press (600ms)
      await user.pointer([
        { keys: '[MouseLeft>]', target: rail }
      ]);
      
      // Fast-forward time to trigger long press
      jest.advanceTimersByTime(600);
      
      // Should open minute sheet
      await waitFor(() => {
        expect(screen.getByText('Select Minutes')).toBeInTheDocument();
      });
      
      // Select a minute option
      const minute15 = screen.getByText('15');
      await user.click(minute15);
      
      // Should call onChange with updated time
      expect(mockOnChange).toHaveBeenCalled();
    });

    it('handedness="left" mirrors layout', () => {
      render(<TimeIndexThumbPicker onChange={mockOnChange} handedness="left" />);
      
      const rail = screen.getByRole('navigation');
      
      // Should have left positioning classes
      expect(rail).toHaveClass('left-0');
      expect(rail).not.toHaveClass('right-0');
    });

    it('handedness="right" uses right layout', () => {
      render(<TimeIndexThumbPicker onChange={mockOnChange} handedness="right" />);
      
      const rail = screen.getByRole('navigation');
      
      // Should have right positioning classes
      expect(rail).toHaveClass('right-0');
      expect(rail).not.toHaveClass('left-0');
    });

    it('12h formatting displays correctly', () => {
      render(<TimeIndexThumbPicker onChange={mockOnChange} format="12h" value="14:30" />);
      
      // Should display 12h format
      const bubble = screen.getByRole('status');
      expect(bubble).toHaveTextContent('2:30 PM');
    });

    it('24h formatting displays correctly', () => {
      render(<TimeIndexThumbPicker onChange={mockOnChange} format="24h" value="14:30" />);
      
      // Should display 24h format
      const bubble = screen.getByRole('status');
      expect(bubble).toHaveTextContent('14:30');
    });

    it('format toggle updates display', async () => {
      const { rerender } = render(<TimeIndexThumbPicker onChange={mockOnChange} format="12h" value="14:30" />);
      
      // Initial 12h format
      let bubble = screen.getByRole('status');
      expect(bubble).toHaveTextContent('2:30 PM');
      
      // Switch to 24h format
      rerender(<TimeIndexThumbPicker onChange={mockOnChange} format="24h" value="14:30" />);
      
      bubble = screen.getByRole('status');
      expect(bubble).toHaveTextContent('14:30');
    });

    it('granularity affects minute snapping', async () => {
      render(<TimeIndexThumbPicker onChange={mockOnChange} granularityMinutes={5} />);
      
      const picker = screen.getByRole('application');
      
      // Trigger time change
      fireEvent.keyDown(picker, { key: 'ArrowRight' });
      
      expect(mockOnChange).toHaveBeenCalled();
      const callArgs = mockOnChange.mock.calls[0][0];
      const [, minute] = callArgs.split(':');
      const minuteValue = parseInt(minute);
      
      // Should snap to 5-minute granularity
      expect(minuteValue % 5).toBe(0);
    });

    it('keyboard navigation works with all keys', async () => {
      render(<TimeIndexThumbPicker onChange={mockOnChange} />);
      
      const picker = screen.getByRole('application');
      
      // Test all navigation keys
      const keys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'PageUp', 'PageDown', 'Home', 'End'];
      
      for (const key of keys) {
        fireEvent.keyDown(picker, { key });
        expect(mockOnChange).toHaveBeenCalled();
        mockOnChange.mockClear();
      }
    });

    it('Enter and Space confirm selection', async () => {
      render(<TimeIndexThumbPicker onChange={mockOnChange} />);
      
      const picker = screen.getByRole('application');
      
      // Test Enter
      fireEvent.keyDown(picker, { key: 'Enter' });
      expect(mockOnChange).toHaveBeenCalled();
      
      mockOnChange.mockClear();
      
      // Test Space
      fireEvent.keyDown(picker, { key: ' ' });
      expect(mockOnChange).toHaveBeenCalled();
    });

    it('Escape cancels operations', async () => {
      render(<TimeIndexThumbPicker onChange={mockOnChange} />);
      
      const picker = screen.getByRole('application');
      const rail = screen.getByRole('navigation');
      
      // Start long press
      await user.pointer([
        { keys: '[MouseLeft>]', target: rail }
      ]);
      
      // Fast-forward to open minute sheet
      jest.advanceTimersByTime(600);
      
      await waitFor(() => {
        expect(screen.getByText('Select Minutes')).toBeInTheDocument();
      });
      
      // Press Escape
      fireEvent.keyDown(picker, { key: 'Escape' });
      
      // Minute sheet should close
      await waitFor(() => {
        expect(screen.queryByText('Select Minutes')).not.toBeInTheDocument();
      });
    });

    it('disabled state prevents interactions', async () => {
      render(<TimeIndexThumbPicker onChange={mockOnChange} disabled={true} />);
      
      const picker = screen.getByRole('application');
      const rail = screen.getByRole('navigation');
      
      // Should not be focusable
      expect(picker).toHaveAttribute('tabIndex', '-1');
      
      // Should not respond to keyboard
      fireEvent.keyDown(picker, { key: 'ArrowUp' });
      expect(mockOnChange).not.toHaveBeenCalled();
      
      // Should not respond to clicks
      await user.click(rail);
      expect(mockOnChange).not.toHaveBeenCalled();
    });

    it('focus management works correctly', async () => {
      render(<TimeIndexThumbPicker onChange={mockOnChange} />);
      
      const picker = screen.getByRole('application');
      
      // Should be focusable
      expect(picker).toHaveAttribute('tabIndex', '0');
      
      // Should focus on tab
      await user.tab();
      expect(picker).toHaveFocus();
    });

    it('announces time changes to screen readers', async () => {
      render(<TimeIndexThumbPicker onChange={mockOnChange} />);
      
      const picker = screen.getByRole('application');
      
      // Trigger time change
      fireEvent.keyDown(picker, { key: 'ArrowUp' });
      
      // Should have live region for announcements
      const liveRegion = screen.getByRole('status');
      expect(liveRegion).toHaveAttribute('aria-live', 'polite');
    });

    it('coarse bucket selection updates correctly', async () => {
      render(<TimeIndexThumbPicker onChange={mockOnChange} />);
      
      // Find all coarse bucket options
      const options = screen.getAllByRole('option');
      expect(options).toHaveLength(4); // M, A, E, N
      
      // Test each option
      for (const option of options) {
        await user.click(option);
        expect(mockOnChange).toHaveBeenCalled();
        mockOnChange.mockClear();
      }
    });

    it('fine hours overlay shows on interaction', async () => {
      render(<TimeIndexThumbPicker onChange={mockOnChange} />);
      
      const rail = screen.getByRole('navigation');
      
      // Start interaction
      await user.pointer([
        { keys: '[MouseLeft>]', target: rail }
      ]);
      
      // Should show fine hours overlay
      await waitFor(() => {
        const fineHours = screen.getByRole('listbox', { name: /Hour selection/i });
        expect(fineHours).toBeInTheDocument();
      });
    });

    it('minute sheet has proper accessibility', async () => {
      render(<TimeIndexThumbPicker onChange={mockOnChange} />);
      
      const rail = screen.getByRole('navigation');
      
      // Long press to open minute sheet
      await user.pointer([
        { keys: '[MouseLeft>]', target: rail }
      ]);
      
      jest.advanceTimersByTime(600);
      
      await waitFor(() => {
        expect(screen.getByText('Select Minutes')).toBeInTheDocument();
      });
      
      // Should have proper accessibility attributes
      const minuteButtons = screen.getAllByRole('button');
      minuteButtons.forEach(button => {
        expect(button).toHaveAttribute('aria-label');
      });
    });

    it('performance: throttled updates during drag', async () => {
      render(<TimeIndexThumbPicker onChange={mockOnChange} />);
      
      const rail = screen.getByRole('navigation');
      
      // Start drag
      await user.pointer([
        { keys: '[MouseLeft>]', target: rail },
        { coords: { x: 100, y: 200 } },
        { coords: { x: 100, y: 300 } },
        { coords: { x: 100, y: 400 } },
        { keys: '[/MouseLeft]' }
      ]);
      
      // Should have called onChange (throttled)
      expect(mockOnChange).toHaveBeenCalled();
      
      // Should not have excessive calls due to throttling
      expect(mockOnChange.mock.calls.length).toBeLessThan(10);
    });
  });
});
