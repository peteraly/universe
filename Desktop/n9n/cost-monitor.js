const fs = require('fs-extra');
const path = require('path');

class CostMonitor {
  constructor() {
    this.costLogFile = path.join(__dirname, 'cost-log.json');
    this.dailyLimit = 0; // $0 daily limit
    this.monthlyLimit = 0; // $0 monthly limit
    this.currentUsage = this.loadUsage();
  }

  loadUsage() {
    try {
      if (fs.existsSync(this.costLogFile)) {
        return JSON.parse(fs.readFileSync(this.costLogFile, 'utf8'));
      }
    } catch (error) {
      console.error('Error loading usage data:', error);
    }
    
    return {
      daily: { requests: 0, tokens: 0, cost: 0, date: new Date().toISOString().split('T')[0] },
      monthly: { requests: 0, tokens: 0, cost: 0, month: new Date().toISOString().slice(0, 7) },
      total: { requests: 0, tokens: 0, cost: 0 }
    };
  }

  saveUsage() {
    try {
      fs.writeFileSync(this.costLogFile, JSON.stringify(this.currentUsage, null, 2));
    } catch (error) {
      console.error('Error saving usage data:', error);
    }
  }

  checkDailyReset() {
    const today = new Date().toISOString().split('T')[0];
    if (this.currentUsage.daily.date !== today) {
      this.currentUsage.daily = { requests: 0, tokens: 0, cost: 0, date: today };
      this.saveUsage();
    }
  }

  checkMonthlyReset() {
    const thisMonth = new Date().toISOString().slice(0, 7);
    if (this.currentUsage.monthly.month !== thisMonth) {
      this.currentUsage.monthly = { requests: 0, tokens: 0, cost: 0, month: thisMonth };
      this.saveUsage();
    }
  }

  logRequest(tokens = 0, cost = 0) {
    this.checkDailyReset();
    this.checkMonthlyReset();
    
    this.currentUsage.daily.requests++;
    this.currentUsage.daily.tokens += tokens;
    this.currentUsage.daily.cost += cost;
    
    this.currentUsage.monthly.requests++;
    this.currentUsage.monthly.tokens += tokens;
    this.currentUsage.monthly.cost += cost;
    
    this.currentUsage.total.requests++;
    this.currentUsage.total.tokens += tokens;
    this.currentUsage.total.cost += cost;
    
    this.saveUsage();
    
    console.log(`💰 Cost Monitor: Daily $${this.currentUsage.daily.cost.toFixed(4)}, Monthly $${this.currentUsage.monthly.cost.toFixed(4)}, Total $${this.currentUsage.total.cost.toFixed(4)}`);
  }

  checkLimits() {
    if (this.currentUsage.daily.cost >= this.dailyLimit) {
      throw new Error(`Daily cost limit reached: $${this.currentUsage.daily.cost.toFixed(4)} >= $${this.dailyLimit}`);
    }
    
    if (this.currentUsage.monthly.cost >= this.monthlyLimit) {
      throw new Error(`Monthly cost limit reached: $${this.currentUsage.monthly.cost.toFixed(4)} >= $${this.monthlyLimit}`);
    }
  }

  getStatus() {
    return {
      daily: {
        requests: this.currentUsage.daily.requests,
        tokens: this.currentUsage.daily.tokens,
        cost: this.currentUsage.daily.cost,
        limit: this.dailyLimit,
        remaining: this.dailyLimit - this.currentUsage.daily.cost
      },
      monthly: {
        requests: this.currentUsage.monthly.requests,
        tokens: this.currentUsage.monthly.tokens,
        cost: this.currentUsage.monthly.cost,
        limit: this.monthlyLimit,
        remaining: this.monthlyLimit - this.currentUsage.monthly.cost
      },
      total: {
        requests: this.currentUsage.total.requests,
        tokens: this.currentUsage.total.tokens,
        cost: this.currentUsage.total.cost
      }
    };
  }

  printStatus() {
    const status = this.getStatus();
    console.log('\n💰 COST MONITORING STATUS');
    console.log('========================');
    console.log(`Daily:   $${status.daily.cost.toFixed(4)} / $${status.daily.limit} (${status.daily.requests} requests)`);
    console.log(`Monthly: $${status.monthly.cost.toFixed(4)} / $${status.monthly.limit} (${status.monthly.requests} requests)`);
    console.log(`Total:   $${status.total.cost.toFixed(4)} (${status.total.requests} requests)`);
    console.log('========================\n');
  }
}

// Export singleton instance
const costMonitor = new CostMonitor();

// Print initial status
costMonitor.printStatus();

module.exports = costMonitor; 