import sys
from PIL import Image
d,n,w,h,cols=sys.argv[1],int(sys.argv[2]),int(sys.argv[3]),int(sys.argv[4]),int(sys.argv[5])
ims=[Image.open(d+'/%02d.png'%i).convert('RGB').resize((w,h),Image.LANCZOS) for i in range(1,n+1)]
rows=(n+cols-1)//cols;sh=Image.new('RGB',(cols*w+(cols+1)*10,rows*h+(rows+1)*10),(120,120,120))
for i,im in enumerate(ims):sh.paste(im,(10+(i%cols)*(w+10),10+(i//cols)*(h+10)))
sh.save(d+'/sheet.jpg',quality=85)
