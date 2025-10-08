// Context: V12.0 UX Polish & Accessibility - Accessibility Check Script
// This script provides comprehensive accessibility testing for the Discovery Dial
// Mission Control system, including WCAG compliance and usability testing.

/* eslint-env node */
import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

class AccessibilityChecker {
  constructor() {
    this.checkResults = {
      wcag: { level: 'AA', compliance: 0 },
      keyboard: { navigation: 0, shortcuts: 0 },
      screenReader: { support: 0, announcements: 0 },
      colorContrast: { ratio: 0, compliance: 0 },
      touchTargets: { size: 0, spacing: 0 },
      totalScore: 0
    }
    
    this.reportDir = path.join(__dirname, '../reports')
    this.ensureReportDirectory()
  }

  /**
   * Ensures the reports directory exists.
   */
  ensureReportDirectory() {
    if (!fs.existsSync(this.reportDir)) {
      fs.mkdirSync(this.reportDir, { recursive: true })
    }
  }

  /**
   * Checks WCAG compliance.
   * @returns {object} WCAG compliance results.
   */
  checkWCAGCompliance() {
    console.log('🔍 Checking WCAG compliance...')
    
    const wcagChecks = {
      level: 'AA',
      compliance: 0,
      issues: [],
      recommendations: []
    }
    
    // Check for required ARIA attributes
    const ariaChecks = [
      'role="main"',
      'role="navigation"',
      'role="banner"',
      'role="contentinfo"',
      'aria-label',
      'aria-live',
      'aria-atomic'
    ]
    
    let ariaScore = 0
    ariaChecks.forEach(check => {
      if (this.checkSourceForPattern(check)) {
        ariaScore += 1
      } else {
        wcagChecks.issues.push(`Missing ARIA attribute: ${check}`)
      }
    })
    
    wcagChecks.compliance = Math.round((ariaScore / ariaChecks.length) * 100)
    
    // Check for semantic HTML
    const semanticChecks = [
      '<main',
      '<nav',
      '<header',
      '<footer',
      '<section',
      '<article'
    ]
    
    let semanticScore = 0
    semanticChecks.forEach(check => {
      if (this.checkSourceForPattern(check)) {
        semanticScore += 1
      } else {
        wcagChecks.issues.push(`Missing semantic element: ${check}`)
      }
    })
    
    wcagChecks.compliance = Math.round(((ariaScore + semanticScore) / (ariaChecks.length + semanticChecks.length)) * 100)
    
    if (wcagChecks.compliance < 90) {
      wcagChecks.recommendations.push('Improve ARIA attributes and semantic HTML structure')
    }
    
    return wcagChecks
  }

  /**
   * Checks keyboard navigation.
   * @returns {object} Keyboard navigation results.
   */
  checkKeyboardNavigation() {
    console.log('⌨️ Checking keyboard navigation...')
    
    const keyboardChecks = {
      navigation: 0,
      shortcuts: 0,
      issues: [],
      recommendations: []
    }
    
    // Check for keyboard event handlers
    const keyboardPatterns = [
      'onKeyDown',
      'onKeyUp',
      'onKeyPress',
      'tabIndex',
      'onFocus',
      'onBlur'
    ]
    
    let keyboardScore = 0
    keyboardPatterns.forEach(pattern => {
      if (this.checkSourceForPattern(pattern)) {
        keyboardScore += 1
      } else {
        keyboardChecks.issues.push(`Missing keyboard handler: ${pattern}`)
      }
    })
    
    keyboardChecks.navigation = Math.round((keyboardScore / keyboardPatterns.length) * 100)
    
    // Check for keyboard shortcuts
    const shortcutPatterns = [
      'Alt +',
      'Ctrl +',
      'keyboard shortcuts',
      'skip links'
    ]
    
    let shortcutScore = 0
    shortcutPatterns.forEach(pattern => {
      if (this.checkSourceForPattern(pattern)) {
        shortcutScore += 1
      } else {
        keyboardChecks.issues.push(`Missing keyboard shortcut: ${pattern}`)
      }
    })
    
    keyboardChecks.shortcuts = Math.round((shortcutScore / shortcutPatterns.length) * 100)
    
    if (keyboardChecks.navigation < 80) {
      keyboardChecks.recommendations.push('Improve keyboard navigation support')
    }
    
    if (keyboardChecks.shortcuts < 60) {
      keyboardChecks.recommendations.push('Add keyboard shortcuts for better accessibility')
    }
    
    return keyboardChecks
  }

  /**
   * Checks screen reader support.
   * @returns {object} Screen reader support results.
   */
  checkScreenReaderSupport() {
    console.log('🔊 Checking screen reader support...')
    
    const screenReaderChecks = {
      support: 0,
      announcements: 0,
      issues: [],
      recommendations: []
    }
    
    // Check for screen reader specific attributes
    const srPatterns = [
      'aria-live',
      'aria-atomic',
      'aria-label',
      'aria-describedby',
      'aria-labelledby',
      'role="alert"',
      'role="status"',
      'sr-only'
    ]
    
    let srScore = 0
    srPatterns.forEach(pattern => {
      if (this.checkSourceForPattern(pattern)) {
        srScore += 1
      } else {
        screenReaderChecks.issues.push(`Missing screen reader attribute: ${pattern}`)
      }
    })
    
    screenReaderChecks.support = Math.round((srScore / srPatterns.length) * 100)
    
    // Check for live announcements
    const announcementPatterns = [
      'aria-live="polite"',
      'aria-live="assertive"',
      'role="alert"',
      'role="status"'
    ]
    
    let announcementScore = 0
    announcementPatterns.forEach(pattern => {
      if (this.checkSourceForPattern(pattern)) {
        announcementScore += 1
      } else {
        screenReaderChecks.issues.push(`Missing live announcement: ${pattern}`)
      }
    })
    
    screenReaderChecks.announcements = Math.round((announcementScore / announcementPatterns.length) * 100)
    
    if (screenReaderChecks.support < 80) {
      screenReaderChecks.recommendations.push('Improve screen reader support with ARIA attributes')
    }
    
    if (screenReaderChecks.announcements < 60) {
      screenReaderChecks.recommendations.push('Add live announcements for dynamic content')
    }
    
    return screenReaderChecks
  }

  /**
   * Checks color contrast compliance.
   * @returns {object} Color contrast results.
   */
  checkColorContrast() {
    console.log('🎨 Checking color contrast...')
    
    const contrastChecks = {
      ratio: 0,
      compliance: 0,
      issues: [],
      recommendations: []
    }
    
    // Check for color contrast considerations
    const contrastPatterns = [
      'high-contrast',
      'prefers-contrast',
      'color-scheme',
      'filter: contrast',
      'background-color',
      'color:'
    ]
    
    let contrastScore = 0
    contrastPatterns.forEach(pattern => {
      if (this.checkSourceForPattern(pattern)) {
        contrastScore += 1
      } else {
        contrastChecks.issues.push(`Missing contrast consideration: ${pattern}`)
      }
    })
    
    contrastChecks.ratio = Math.round((contrastScore / contrastPatterns.length) * 100)
    contrastChecks.compliance = contrastChecks.ratio
    
    if (contrastChecks.compliance < 80) {
      contrastChecks.recommendations.push('Improve color contrast ratios for better readability')
    }
    
    return contrastChecks
  }

  /**
   * Checks touch target sizes.
   * @returns {object} Touch target results.
   */
  checkTouchTargets() {
    console.log('👆 Checking touch targets...')
    
    const touchChecks = {
      size: 0,
      spacing: 0,
      issues: [],
      recommendations: []
    }
    
    // Check for touch target considerations
    const touchPatterns = [
      'min-height: 44px',
      'min-width: 44px',
      'touch-action',
      'user-select: none',
      'cursor: pointer'
    ]
    
    let touchScore = 0
    touchPatterns.forEach(pattern => {
      if (this.checkSourceForPattern(pattern)) {
        touchScore += 1
      } else {
        touchChecks.issues.push(`Missing touch target consideration: ${pattern}`)
      }
    })
    
    touchChecks.size = Math.round((touchScore / touchPatterns.length) * 100)
    touchChecks.spacing = touchChecks.size
    
    if (touchChecks.size < 80) {
      touchChecks.recommendations.push('Ensure touch targets are at least 44px in size')
    }
    
    return touchChecks
  }

  /**
   * Checks source code for a specific pattern.
   * @param {string} pattern - The pattern to search for.
   * @returns {boolean} True if pattern is found.
   */
  checkSourceForPattern(pattern) {
    try {
      const sourceFiles = [
        'src/components/DiscoveryDial.jsx',
        'src/components/AccessibilityEnhancements.jsx',
        'src/App.jsx'
      ]
      
      for (const file of sourceFiles) {
        const filePath = path.join(__dirname, '..', file)
        if (fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath, 'utf8')
          if (content.includes(pattern)) {
            return true
          }
        }
      }
      
      return false
    } catch (error) {
      console.error(`Error checking pattern ${pattern}:`, error.message)
      return false
    }
  }

  /**
   * Runs the complete accessibility check.
   * @returns {object} The accessibility check results.
   */
  runAccessibilityCheck() {
    console.log('🚀 Starting accessibility check...')
    
    const wcag = this.checkWCAGCompliance()
    const keyboard = this.checkKeyboardNavigation()
    const screenReader = this.checkScreenReaderSupport()
    const contrast = this.checkColorContrast()
    const touch = this.checkTouchTargets()
    
    const results = {
      wcag,
      keyboard,
      screenReader,
      contrast,
      touch,
      totalScore: 0
    }
    
    // Calculate total score
    results.totalScore = Math.round(
      (wcag.compliance + keyboard.navigation + keyboard.shortcuts + 
       screenReader.support + screenReader.announcements + 
       contrast.compliance + touch.size + touch.spacing) / 8
    )
    
    // Save results
    const reportPath = path.join(this.reportDir, `accessibility-check-${Date.now()}.json`)
    fs.writeFileSync(reportPath, JSON.stringify(results, null, 2))
    
    // Display results
    console.log('\n📊 Accessibility Check Results:')
    console.log(`♿ WCAG Compliance: ${wcag.compliance}/100`)
    console.log(`⌨️ Keyboard Navigation: ${keyboard.navigation}/100`)
    console.log(`⌨️ Keyboard Shortcuts: ${keyboard.shortcuts}/100`)
    console.log(`🔊 Screen Reader Support: ${screenReader.support}/100`)
    console.log(`🔊 Live Announcements: ${screenReader.announcements}/100`)
    console.log(`🎨 Color Contrast: ${contrast.compliance}/100`)
    console.log(`👆 Touch Targets: ${touch.size}/100`)
    console.log(`📈 Total Score: ${results.totalScore}/100`)
    console.log(`🎯 Status: ${results.totalScore >= 85 ? 'PASS' : 'FAIL'}`)
    
    // Display issues and recommendations
    const allIssues = [...wcag.issues, ...keyboard.issues, ...screenReader.issues, ...contrast.issues, ...touch.issues]
    const allRecommendations = [...wcag.recommendations, ...keyboard.recommendations, ...screenReader.recommendations, ...contrast.recommendations, ...touch.recommendations]
    
    if (allIssues.length > 0) {
      console.log('\n⚠️ Issues Found:')
      allIssues.forEach(issue => console.log(`   • ${issue}`))
    }
    
    if (allRecommendations.length > 0) {
      console.log('\n💡 Recommendations:')
      allRecommendations.forEach(rec => console.log(`   • ${rec}`))
    }
    
    console.log(`\n📊 Report saved to: ${reportPath}`)
    
    return results
  }
}

// Export for use in other scripts
export { AccessibilityChecker }

// Run check if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const checker = new AccessibilityChecker()
  const results = checker.runAccessibilityCheck()
  process.exit(results.totalScore >= 85 ? 0 : 1)
}
