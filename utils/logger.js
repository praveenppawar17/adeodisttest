import fs from "fs";
import path from "path";

class Logger {
  constructor(logDirectory) {
    this.logDirectory = logDirectory;
    this.currentLogFile = null;
    this.currentLogCreatedAt = null;

    // start timers for log file creation and cleanup
    setInterval(() => this.checkCreateNewLogFile(), 60 * 1000); // 1 minute to creating new log files
    this.checkCreateNewLogFile(); // creates initial log file

    setInterval(() => this.cleanupOldLogFiles(), 30 * 60 * 1000);
    this.cleanupOldLogFiles(); // performs initial cleanup
  }

  checkCreateNewLogFile() {
    if (!this.currentLogFile || this.shouldCreateNewLogFile()) {
      this.createNewLogFile();
    }
  }

  shouldCreateNewLogFile() {
    if (!this.currentLogCreatedAt) {
      return true;
    }

    const elapsedTime = new Date() - this.currentLogCreatedAt;
    return elapsedTime > 5 * 60 * 1000; // ths s 5 minutes in milliseconds
  }

  createNewLogFile() {
    const now = new Date();
    const fileName = `log_${now.getTime()}.txt`;

    // ensure the log directory exists
    if (!fs.existsSync(this.logDirectory)) {
      fs.mkdirSync(this.logDirectory, { recursive: true });
    }

    this.currentLogFile = fs.createWriteStream(
      path.join(this.logDirectory, fileName)
    );
    this.currentLogCreatedAt = now;
  }

  cleanupOldLogFiles() {
    const files = fs.readdirSync(this.logDirectory);
    const currentTime = new Date();

    files.forEach((file) => {
      const filePath = path.join(this.logDirectory, file);
      const fileStats = fs.statSync(filePath);
      const elapsedTime = currentTime - fileStats.mtime;

      if (elapsedTime > 30 * 60 * 1000) {
        fs.unlinkSync(filePath); // delete files older than 30 minutes
      }
    });
  }

  log(message) {
    this.checkCreateNewLogFile();

    const logEntry = `[${new Date()}] ${message}\n`;
    this.currentLogFile.write(logEntry);
  }
}

export default Logger;
