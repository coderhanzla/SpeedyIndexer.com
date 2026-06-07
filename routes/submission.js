const express = require('express');
const multer = require('multer');
const csv = require('csv-parser');
const { Parser } = require('xml2js');
const { indexingQueue } = require('../queue/indexingQueue');
const UrlJob = require('../models/UrlJob');
const auth = require('../middleware/auth');
const { emitQueueUpdate } = require('../server');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Single URL Submission
router.post('/single', auth, async (req, res) => {
    try {
        const { url } = req.body;
        const userId = req.user.id;

        const job = await UrlJob.create({
            userId,
            urls: [{ url }],
            totalUrls: 1,
            queueId: `job_${Date.now()}`
        });

        await indexingQueue.add('process', {
            urls: [{ url }],
            jobId: job._id
        }, {
            priority: 1,
            delay: 0
        });

        emitQueueUpdate(job.queueId, { status: 'queued', total: 1 });
        res.json({ jobId: job._id, queueId: job.queueId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Bulk CSV/XML Upload
router.post('/bulk', auth, upload.single('file'), async (req, res) => {
    try {
        const userId = req.user.id;
        let urls = [];

        if (req.file.mimetype === 'text/csv') {
            urls = await parseCSV(req.file.path);
        } else if (req.file.mimetype === 'application/xml') {
            urls = await parseXML(req.file.path);
        }

        const job = await UrlJob.create({
            userId,
            urls: urls.slice(0, 25000), // Max 25k URLs
            totalUrls: urls.length,
            queueId: `bulk_${Date.now()}`
        });

        // Drip-feed scheduling (50 concurrent)
        for (let i = 0; i < urls.length; i += 50) {
            setTimeout(() => {
                urls.slice(i, i + 50).forEach(url => {
                    indexingQueue.add('process', { url, jobId: job._id });
                });
            }, i * 1000); // 1s delay between batches
        }

        res.json({ jobId: job._id, total: urls.length });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

function parseCSV(filePath) {
    return new Promise((resolve, reject) => {
        const results = [];
        require('fs').createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => results.push(data.url))
            .on('end', () => resolve(results))
            .on('error', reject);
    });
}

function parseXML(filePath) {
    return new Promise((resolve, reject) => {
        const fs = require('fs');
        const parser = new Parser();
        fs.readFile(filePath, (err, data) => {
            if (err) return reject(err);
            parser.parseString(data, (err, result) => {
                const urls = result.urlset?.url?.map(loc => loc.loc[0]) || [];
                resolve(urls);
            });
        });
    });
}

module.exports = router;