const {formidable} = require('formidable');
const {createClient} = require('@supabase/supabase-js')
const asyncHandler = require('../middleware/async');

const supabaseAdmin = createClient(process.env.SUPABASE_PROJECT_URL, process.env.SUPABASE_ANON_KEY);

 const uploadFile = asyncHandler(async  (req, res) => {
    try {
      const {file} = req.files || {};
      if(!file) {
        return res.status(422).json({success: true, message: 'No file included'})
      }
       let fileName = file.name;
       if(!/\.pdf$/.test(fileName)) {
        return res.status(422).json({success:false, message: 'File type not supported'})
       }
      await supabaseAdmin.storage.from('attachments').upload(`pdf/${fileName}`, file);
      const {
        data: { publicUrl },
      } = supabaseAdmin.storage.from('attachments').getPublicUrl(`pdf/${fileName}`);

      return res.status(200).json({success:true, data: {fileUrl: publicUrl}})
    }catch(e) {
      console.log(e);
      return res.status(500).json({success: false, message: 'An error occurred while uploading file'})
    }
})

module.exports = uploadFile;