const Grievance = require('../models/Grievance');

// Submit grievance
exports.submitGrievance = async (req, res) => {
  try {
    const { title, description, category } = req.body;

    const newGrievance = new Grievance({
      title,
      description,
      category,
      user: req.user.id,
    });

    const savedGrievance = await newGrievance.save();
    res.status(201).json(savedGrievance);
  } catch (error) {
    console.error('Error submitting grievance:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// View all grievances (for logged in user)
exports.getGrievances = async (req, res) => {
  try {
    const grievances = await Grievance.find({ user: req.user.id }).sort({ date: -1 });
    res.json(grievances);
  } catch (error) {
    console.error('Error fetching grievances:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// View grievance by ID
exports.getGrievanceById = async (req, res) => {
  try {
    const grievance = await Grievance.findById(req.params.id);

    if (!grievance) {
      return res.status(404).json({ message: 'Grievance not found' });
    }

    // Ensure user owns the grievance
    if (grievance.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    res.json(grievance);
  } catch (error) {
    console.error('Error fetching grievance by ID:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Grievance not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// Update grievance
exports.updateGrievance = async (req, res) => {
  try {
    const { title, description, category, status } = req.body;

    let grievance = await Grievance.findById(req.params.id);

    if (!grievance) {
      return res.status(404).json({ message: 'Grievance not found' });
    }

    // Ensure user owns the grievance
    if (grievance.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    // Update fields
    if (title) grievance.title = title;
    if (description) grievance.description = description;
    if (category) grievance.category = category;
    if (status) grievance.status = status;

    grievance = await Grievance.findByIdAndUpdate(
      req.params.id,
      { $set: grievance },
      { new: true }
    );

    res.json(grievance);
  } catch (error) {
    console.error('Error updating grievance:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete grievance
exports.deleteGrievance = async (req, res) => {
  try {
    const grievance = await Grievance.findById(req.params.id);

    if (!grievance) {
      return res.status(404).json({ message: 'Grievance not found' });
    }

    // Ensure user owns the grievance
    if (grievance.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    await Grievance.findByIdAndDelete(req.params.id);

    res.json({ message: 'Grievance removed' });
  } catch (error) {
    console.error('Error deleting grievance:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Grievance not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// Search grievance
exports.searchGrievances = async (req, res) => {
  try {
    const titleRegex = new RegExp(req.query.title, 'i');
    
    const grievances = await Grievance.find({
      user: req.user.id,
      title: { $regex: titleRegex }
    });

    res.json(grievances);
  } catch (error) {
    console.error('Error searching grievances:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
