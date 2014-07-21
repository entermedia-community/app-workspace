package ocr;
import org.netevolved.ocr.OcrRules
import org.openedit.entermedia.Asset;
import org.openedit.entermedia.MediaArchive;
import java.io.File;
import com.openedit.page.manage.*
import org.openedit.repository.ContentItem

public class rules implements OcrRules{
	

	@Override
	public boolean shouldOcr(MediaArchive inArchive, ContentItem inFile, Asset inAsset) {
               if(inAsset.getSourcePath().contains("OCR_TEST")){
                       return true;
                }
               else if(inAsset.getSourcePath().contains("OCR_2")){
                       return true;
                }
		return false;
	}
}

